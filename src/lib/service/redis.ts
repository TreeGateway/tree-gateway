"use strict";

import {Redis} from "ioredis";

import {ApiService, ApiComponentService, GroupService, ThrottlingService,
    CacheService, ProxyService, AuthenticationService, CircuitBreakerService, 
    CorsService, ConfigService, NotFoundError, DuplicatedError} from "./api";

import {ApiConfig} from "../config/api";
import {CacheConfig} from "../config/cache";
import {ThrottlingConfig} from "../config/throttling";
import {CircuitBreakerConfig} from "../config/circuit-breaker";
import {ApiCorsConfig} from "../config/cors";
import {Group} from "../config/group";
import {Proxy} from "../config/proxy";
import {AuthenticationConfig} from "../config/authentication";
import {ConfigTopics} from "../config/events";
import * as uuid from "uuid";
import {Logger} from "../logger";
import {AutoWired, Provides, Inject} from "typescript-ioc";
import {Database} from "../database";
import {MiddlewareInstaller} from "../utils/middleware-installer";
import {EventEmitter} from "events";

class Constants {
    static APIS_PREFIX = "{config}:apis";
}

@AutoWired
export class RedisService {
    @Inject
    protected database: Database;
}

@AutoWired
@Provides(ApiService)
export class RedisApiService extends RedisService implements ApiService {
    list(): Promise<Array<ApiConfig>> {
        return new Promise((resolve, reject) => {
            this.database.redisClient.hgetall(Constants.APIS_PREFIX)
                .then((apis) => {
                    apis = Object.keys(apis).map(key => JSON.parse(apis[key]));
                    resolve(apis);
                })
                .catch(reject);
        });
    }

    get(id: string): Promise<ApiConfig> {
        return new Promise((resolve, reject) => {
            this.database.redisClient.hget(Constants.APIS_PREFIX, id)
                .then((api) => {
                    if (!api) {
                        throw new NotFoundError('Api not found.');
                    }

                    resolve(JSON.parse(api));
                })
                .catch(reject);
        });
    }

    create(api: ApiConfig): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            api.id = uuid();

            this.database.redisClient.hexists(`${Constants.APIS_PREFIX}`, api.id)
                .then((exists) => {
                    if (exists) {
                        throw new DuplicatedError(`Api ${api.id} already exists`)
                    }

                    return this.database.redisClient.multi()
                               .hmset(`${Constants.APIS_PREFIX}`, api.id, JSON.stringify(api))
                               .publish(ConfigTopics.API_ADDED, JSON.stringify({id: api.id}))
                               .exec()
                })
                .then(() => {
                    resolve(api.id);
                })
                .catch(reject);
        });
    }

    update(api: ApiConfig): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.database.redisClient.hexists(`${Constants.APIS_PREFIX}`, api.id)
                .then((exists) => {
                    if (!exists) {
                        throw new NotFoundError('Api not found.');
                    }

                    return this.database.redisClient.multi()
                               .hmset(`${Constants.APIS_PREFIX}`, api.id, JSON.stringify(api))
                               .publish(ConfigTopics.API_UPDATED, JSON.stringify({id: api.id}))
                               .exec();
                })
                .then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }

    remove(id: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            // TODO: remove children
            this.database.redisClient.multi()
                .hdel(`${Constants.APIS_PREFIX}`, id)
                .publish(ConfigTopics.API_REMOVED, JSON.stringify({id}))
                .exec()
                .then((count) => {
                    // FIXME: multi() does not return count.
                    if (count === 0) {
                        throw new NotFoundError('Api not found.');
                    }

                    resolve();
                })
                .catch(reject);
        });
    }
}

@AutoWired
export abstract class RedisApiComponentService<T> extends RedisService implements ApiComponentService<T> {
    abstract getMapName(): string;

    getComponentKey(component: T): Promise<string> {
        return Promise.resolve(uuid());
    }

    private getMapKey(apiId: string): string {
        return `${Constants.APIS_PREFIX}:${apiId}:${this.getMapName()}`;
    }

    list(apiId: string): Promise<Array<T>> {
        return new Promise((resolve, reject) => {
            this.database.redisClient.hgetall(this.getMapKey(apiId))
                .then((items) => {
                    items = Object.keys(items).map(key => JSON.parse(items[key]));
                    resolve(items);
                })
                .catch(reject);
        });
    }

    get(apiId: string, componentId: string): Promise<T> {
        return new Promise((resolve, reject) => {
            this.database.redisClient.hget(this.getMapKey(apiId), componentId)
                .then((component) => {
                    if (!component) {
                        throw new NotFoundError('Component not found.');
                    }

                    resolve(JSON.parse(component));
                })
                .catch(reject);
        });
    }

    create(apiId: string, component: T): Promise<string> {
        return new Promise((resolve, reject) => {
            let location;

            this.getComponentKey(component)
                .then((key) => {
                    location = key;
                    component["id"] = key;

                    return this.database.redisClient.multi()
                               .hmset(this.getMapKey(apiId), key, JSON.stringify(component))
                               .publish(ConfigTopics.API_UPDATED, JSON.stringify({id: apiId}))
                               .exec();
                })
                .then(() => {
                    resolve(location);
                })
                .catch(reject);
        });
    }

    update(apiId: string, componentId: string, component: T): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const mapKey = this.getMapKey(apiId);

            this.database.redisClient.hexists(mapKey, componentId)
                .then((exists) => {
                    if (!exists) {
                        throw new NotFoundError('Component not found.');
                    }

                    return this.database.redisClient.multi()
                               .hmset(mapKey, componentId, JSON.stringify(component))
                               .publish(ConfigTopics.API_UPDATED, JSON.stringify({id: apiId}))
                               .exec();
                })
                .then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }

    remove(apiId: string, componentId: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            return this.database.redisClient.multi()
                       .hdel(this.getMapKey(apiId), componentId)
                       .publish(ConfigTopics.API_UPDATED, JSON.stringify({id: apiId}))
                       .exec()
                       .then((count) => {
                            // FIXME: multi() does not return count.
                            if (count === 0) {
                                throw new NotFoundError('Component not found.');
                            }

                            resolve();
                       })
                       .catch(reject);
        });
    }
}

@AutoWired
@Provides(GroupService)
export class RedisGroupService extends RedisApiComponentService<Group> implements GroupService {
    getMapName(): string {
        return "groups";
    }
}

@AutoWired
@Provides(ThrottlingService)
export class RedisThrottlingService extends RedisApiComponentService<ThrottlingConfig> implements ThrottlingService {
    getMapName(): string {
        return "throttling";
    }
}

@AutoWired
@Provides(CircuitBreakerService)
export class RedisCircuitBreakerService extends RedisApiComponentService<CircuitBreakerConfig> implements CircuitBreakerService {
    getMapName(): string {
        return "circuitbreaker";
    }
}

@AutoWired
@Provides(CorsService)
export class RedisCorsService extends RedisApiComponentService<ApiCorsConfig> implements CorsService {
    getMapName(): string {
        return "cors";
    }
}

@AutoWired
@Provides(CacheService)
export class RedisCacheService extends RedisApiComponentService<CacheConfig> implements CacheService {
    getMapName(): string {
        return "cache";
    }
}

@AutoWired
@Provides(ProxyService)
export class RedisProxyService extends RedisService implements ProxyService {

    get(apiId: string): Promise<Proxy> {
        return new Promise((resolve, reject) => {
            this.database.redisClient.get(`${Constants.APIS_PREFIX}:${apiId}:proxy`)
                .then((proxy) => {
                    if (!proxy) {
                        throw new NotFoundError('Proxy not found.');
                    }

                    resolve(JSON.parse(proxy));
                })
                .catch(reject);
        });
    }

    create(apiId: string, proxy: Proxy): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.database.redisClient.hexists(`${Constants.APIS_PREFIX}`, apiId)
                .then((exists) => {
                    if (!exists) {
                        throw new NotFoundError('Api not found.');
                    }

                    return this.database.redisClient.multi()
                               .set(`${Constants.APIS_PREFIX}:${apiId}:proxy`, JSON.stringify(proxy))
                               .publish(ConfigTopics.API_UPDATED, JSON.stringify({id: apiId}))
                               .exec();
                })
                .then(() => resolve())
                .catch(reject);
        });
    }

    update(apiId: string, proxy: Proxy): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const key = `${Constants.APIS_PREFIX}:${apiId}:proxy`;

            this.database.redisClient.exists(key)
                .then((exists) => {
                    if (!exists) {
                        throw new NotFoundError('Proxy not found.');
                    }

                    return this.database.redisClient.multi()
                               .set(key, JSON.stringify(proxy))
                               .publish(ConfigTopics.API_UPDATED, JSON.stringify({id: apiId}))
                               .exec();
                })
                .then(() => resolve())
                .catch(reject);
        });
    }

    remove(apiId: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const key = `${Constants.APIS_PREFIX}:${apiId}:proxy`;

            this.database.redisClient.exists(key)
                .then((exists) => {
                    if (!exists) {
                        throw new NotFoundError('Proxy not found.');
                    }

                    return this.database.redisClient.multi()
                               .del(key)
                               .publish(ConfigTopics.API_UPDATED, JSON.stringify({id: apiId}))
                               .exec();
                })
                .then(() => resolve())
                .catch(reject);
        });
    }
}

@AutoWired
@Provides(AuthenticationService)
export class RedisAuthenticationService extends RedisService implements AuthenticationService {

    get(apiId: string): Promise<AuthenticationConfig> {
        return new Promise((resolve, reject) => {
            this.database.redisClient.get(`${Constants.APIS_PREFIX}:${apiId}:authentication`)
                .then((auth) => {
                    if (!auth) {
                        throw new NotFoundError('Authentication config not found.');
                    }

                    resolve(JSON.parse(auth));
                })
                .catch(reject);
        });
    }

    create(apiId: string, auth: AuthenticationConfig): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.database.redisClient.multi()
                .set(`${Constants.APIS_PREFIX}:${apiId}:authentication`, JSON.stringify(auth))
                .publish(ConfigTopics.API_UPDATED, JSON.stringify({id: apiId}))
                .exec()
                .then(() => resolve())
                .catch(reject);
        });
    }

    update(apiId: string, auth: AuthenticationConfig): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const key = `${Constants.APIS_PREFIX}:${apiId}:authentication`;

            this.database.redisClient.exists(key)
                .then((exists) => {
                    if (!exists) {
                        throw new NotFoundError('Authentication config not found.');
                    }

                    return this.database.redisClient.multi()
                               .set(key, JSON.stringify(auth))
                               .publish(ConfigTopics.API_UPDATED, JSON.stringify({id: apiId}))
                               .exec();
                })
                .then(() => resolve())
                .catch(reject);
        });
    }

    remove(apiId: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.database.redisClient.multi()
                .del(`${Constants.APIS_PREFIX}:${apiId}:authentication`)
                .publish(ConfigTopics.API_UPDATED, JSON.stringify({id: apiId}))
                .exec()
                .then((count) => {
                    // FIXME: multi() don't return count.
                    if (count === 0) {
                        throw new NotFoundError('Authentication config not found.');
                    }

                    resolve();
                })
                .catch(reject);
        });
    }
}


@AutoWired
@Provides(ConfigService)
export class RedisConfigService extends EventEmitter implements ConfigService {
    @Inject private logger: Logger;
    @Inject private apiService: ApiService;
    @Inject private proxyService: ProxyService;
    @Inject private groupService: GroupService;
    @Inject private throttlingService: ThrottlingService;
    @Inject private circuitBreakerService: CircuitBreakerService;
    @Inject private corsService: CorsService;
    @Inject private cacheService: CacheService;
    @Inject private authService: AuthenticationService;
    @Inject private middlewareInstaller: MiddlewareInstaller;
    @Inject private database: Database;

    getApiConfig(apiId: string): Promise<ApiConfig> {
        return new Promise<ApiConfig>((resolve, reject) => {
            this.apiService.get(apiId)
                .then((api) => {
                    return this.loadProxy(api);
                })
                .then((api) => {
                    if (api) {
                        return this.loadApiDetails(api);
                    } else {
                        return Promise.resolve(null);
                    }
                })
                .then(resolve)
                .catch(reject);
        });
    }

    getAllApiConfig(): Promise<Array<ApiConfig>> {
        return new Promise<Array<ApiConfig>>((resolve, reject) => {
            this.apiService.list()
                .then((apis) => {
                    return Promise.all(apis.map((el) => this.loadProxy(el)));
                })
                .then((apis) => {
                    apis = apis.filter(el => el ? true : false);

                    return Promise.all(apis.map(el => this.loadApiDetails(el)));
                })
                .then(resolve)
                .catch(reject);
        });
    }

    subscribeEvents(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const topicPattern = `${ConfigTopics.BASE_TOPIC}:*`;

            this.database.redisEvents.psubscribe(topicPattern)
                .then(() => {
                    return this.database.redisEvents.on('pmessage', (pattern, channel, message) => {
                        try {
                            this.onConfigUpdated(channel, JSON.parse(message));
                        } catch (err) {
                            this.logger.error(`Error processing config event: ${err.message}`);
                        }
                    });
                })
                .then(() => {
                    if (this.logger.isDebugEnabled()) {
                        this.logger.debug(`Listening to events on topic ${topicPattern}`);
                    }

                    resolve();
                })
                .catch(reject);
        });
    }

    private onConfigUpdated(eventTopic: string, message: any) {
        if (this.logger.isDebugEnabled()) {
            this.logger.debug(`Config updated ${eventTopic}`);
        }

        switch(eventTopic) {
            case ConfigTopics.API_REMOVED:
                this.emit('apiRemoved', message.id);
                break;
            case ConfigTopics.API_ADDED:
                this.emit('apiAdded', message.id);
                break;
            case ConfigTopics.API_UPDATED:
                this.emit('apiUpdated', message.id);
                break;
            case ConfigTopics.MIDDLEWARE_ADDED:
            case ConfigTopics.MIDDLEWARE_UPDATED:
                this.middlewareInstaller.install(message.type, message.name);
                break;
            case ConfigTopics.MIDDLEWARE_REMOVED:
                this.middlewareInstaller.uninstall(message.type, message.name);
                break;
            default:
                this.logger.error(`Unknown event type ${eventTopic}: ${message}`);
        }
    }

    private loadProxy(apiConfig: ApiConfig): Promise<ApiConfig> {
        return new Promise((resolve, reject) => {
            this.proxyService.get(apiConfig.id)
                .then((proxy) => {
                    apiConfig.proxy = proxy;
                    resolve(apiConfig);
                })
                .catch((err) => {
                    resolve(null);
                });
        });
    }

    private loadApiDetails(apiConfig: ApiConfig): Promise<ApiConfig> {
        return new Promise((resolve, reject) => {
            this.groupService.list(apiConfig.id)
                .then((groups) => {
                    if (groups && groups.length > 0) {
                        apiConfig.group = groups;
                    }
                    return this.throttlingService.list(apiConfig.id);
                })
                .then((throttling) => {
                    if (throttling && throttling.length > 0) {
                        apiConfig.throttling = throttling;
                    }
                    return this.circuitBreakerService.list(apiConfig.id);
                })
                .then((circuitBreaker) => {
                    if (circuitBreaker && circuitBreaker.length > 0) {
                        apiConfig.circuitBreaker = circuitBreaker;
                    }
                    return this.corsService.list(apiConfig.id);
                })
                .then((cors) => {
                    if (cors && cors.length > 0) {
                        apiConfig.cors = cors;
                    }
                    return this.cacheService.list(apiConfig.id);
                })
                .then((cache) => {
                    if (cache && cache.length > 0) {
                        apiConfig.cache = cache;
                    }
                    return this.authService.get(apiConfig.id);
                })
                .then((auth) => {
                    if (auth) {
                        apiConfig.authentication = auth;
                    }
                    return apiConfig;
                }, (err) => {
                    if (!(err instanceof NotFoundError)) {
                        throw err;
                    }

                    return apiConfig;
                })
                .then(resolve)
                .catch(reject);
        });
    }
}