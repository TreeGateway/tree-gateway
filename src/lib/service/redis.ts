"use strict";

import {Redis} from "ioredis";

import {ApiService, ApiComponentService, GroupService, ThrottlingService,
    CacheService, ProxyService, AuthenticationService, CircuitBreakerService, 
    ConfigService, NotFoundError, DuplicatedError} from "./api";

import {ApiConfig} from "../config/api";
import {CacheConfig} from "../config/cache";
import {ThrottlingConfig} from "../config/throttling";
import {CircuitBreakerConfig} from "../config/circuit-breaker";
import {Group} from "../config/group";
import {Proxy} from "../config/proxy";
import {AuthenticationConfig} from "../config/authentication";
import {ConfigTopics} from "../config/events";
import {Gateway} from "../gateway";
import * as uuid from "uuid";

class Constants {
    static APIS_PREFIX = "{config}:apis";
}

export class RedisService {
    protected redisClient:Redis;

    constructor(redisClient) {
        this.redisClient = redisClient;
    }
}

export class RedisApiService extends RedisService implements ApiService {
    private proxyService:ProxyService;

    constructor(redisClient) {
        super(redisClient);
        this.proxyService = new RedisProxyService(redisClient);
    }

    list(): Promise<Array<ApiConfig>> {
        return new Promise((resolve, reject) => {
            this.redisClient.hgetall(Constants.APIS_PREFIX)
                .then((apis) => {
                    apis = Object.keys(apis).map(key => JSON.parse(apis[key]));
                    resolve(apis);
                })
                .catch(reject);
        });
    }

    get(id: string): Promise<ApiConfig> {
        return new Promise((resolve, reject) => {
            this.redisClient.hget(Constants.APIS_PREFIX, id)
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

            this.redisClient.hexists(`${Constants.APIS_PREFIX}`, api.id)
                .then((exists) => {
                    if (exists) {
                        throw new DuplicatedError(`Api ${api.id} already exists`)
                    }

                    return this.redisClient.multi()
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
            this.redisClient.hexists(`${Constants.APIS_PREFIX}`, api.id)
                .then((exists) => {
                    if (!exists) {
                        throw new NotFoundError('Api not found.');
                    }

                    return this.redisClient.multi()
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
            this.redisClient.multi()
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
            this.redisClient.hgetall(this.getMapKey(apiId))
                .then((items) => {
                    items = Object.keys(items).map(key => JSON.parse(items[key]));
                    resolve(items);
                })
                .catch(reject);
        });
    }

    get(apiId: string, componentId: string): Promise<T> {
        return new Promise((resolve, reject) => {
            this.redisClient.hget(this.getMapKey(apiId), componentId)
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

                    return this.redisClient.multi()
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

            this.redisClient.hexists(mapKey, componentId)
                .then((exists) => {
                    if (!exists) {
                        throw new NotFoundError('Component not found.');
                    }

                    return this.redisClient.multi()
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
            return this.redisClient.multi()
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

export class RedisGroupService extends RedisApiComponentService<Group> implements GroupService {
    getMapName(): string {
        return "groups";
    }
}

export class RedisThrottlingService extends RedisApiComponentService<ThrottlingConfig> implements ThrottlingService {
    getMapName(): string {
        return "throttling";
    }
}

export class RedisCircuitBreakerService extends RedisApiComponentService<CircuitBreakerConfig> implements CircuitBreakerService {
    getMapName(): string {
        return "circuitbreaker";
    }
}

export class RedisCacheService extends RedisApiComponentService<CacheConfig> implements CacheService {
    getMapName(): string {
        return "cache";
    }
}

export class RedisProxyService extends RedisService implements ProxyService {

    get(apiId: string): Promise<Proxy> {
        return new Promise((resolve, reject) => {
            this.redisClient.get(`${Constants.APIS_PREFIX}:${apiId}:proxy`)
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
            this.redisClient.hexists(`${Constants.APIS_PREFIX}`, apiId)
                .then((exists) => {
                    if (!exists) {
                        throw new NotFoundError('Api not found.');
                    }

                    return this.redisClient.multi()
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

            this.redisClient.exists(key)
                .then((exists) => {
                    if (!exists) {
                        throw new NotFoundError('Proxy not found.');
                    }

                    return this.redisClient.multi()
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

            this.redisClient.exists(key)
                .then((exists) => {
                    if (!exists) {
                        throw new NotFoundError('Proxy not found.');
                    }

                    return this.redisClient.multi()
                               .del(key)
                               .publish(ConfigTopics.API_UPDATED, JSON.stringify({id: apiId}))
                               .exec();
                })
                .then(() => resolve())
                .catch(reject);
        });
    }
}

export class RedisAuthenticationService extends RedisService implements AuthenticationService {

    get(apiId: string): Promise<AuthenticationConfig> {
        return new Promise((resolve, reject) => {
            this.redisClient.get(`${Constants.APIS_PREFIX}:${apiId}:authentication`)
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
            this.redisClient.multi()
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

            this.redisClient.exists(key)
                .then((exists) => {
                    if (!exists) {
                        throw new NotFoundError('Authentication config not found.');
                    }

                    return this.redisClient.multi()
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
            this.redisClient.multi()
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

export class RedisConfigService extends RedisService implements ConfigService {
    private _apiService: ApiService;
    private _proxyService: ProxyService;
    private _groupService: GroupService;
    private _throttlingService: ThrottlingService;
    private _circuitBreakerService: CircuitBreakerService;
    private _cacheService: CacheService;
    private _authService: AuthenticationService;
    private gateway: Gateway;

    constructor(gateway: Gateway) {
        super(gateway.redisClient);
        this._apiService = new RedisApiService(gateway.redisClient);
        this._proxyService = new RedisProxyService(gateway.redisClient);
        this._groupService = new RedisGroupService(gateway.redisClient);
        this._throttlingService = new RedisThrottlingService(gateway.redisClient);
        this._circuitBreakerService = new RedisCircuitBreakerService(gateway.redisClient);
        this._cacheService = new RedisCacheService(gateway.redisClient);
        this._authService = new RedisAuthenticationService(gateway.redisClient);
        this.gateway = gateway;
    }

    getApiConfig(apiId: string): Promise<ApiConfig> {
        return new Promise<ApiConfig>((resolve, reject) => {
            this._apiService.get(apiId)
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
            this._apiService.list()
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

            this.gateway.redisEvents.psubscribe(topicPattern)
                .then(() => {
                    return this.gateway.redisEvents.on('pmessage', (pattern, channel, message) => {
                        try {
                            this.onConfigUpdated(channel, JSON.parse(message));
                        } catch (err) {
                            this.gateway.logger.error(`Error processing config event: ${err.message}`);
                        }
                    });
                })
                .then(() => {
                    if (this.gateway.logger.isDebugEnabled()) {
                        this.gateway.logger.debug(`Listening to events on topic ${topicPattern}`);
                    }

                    resolve();
                })
                .catch(reject);
        });
    }

    private onConfigUpdated(eventTopic: string, message: any) {
        if (this.gateway.logger.isDebugEnabled()) {
            this.gateway.logger.debug(`Config updated ${eventTopic}`);
        }

        switch(eventTopic) {
            case ConfigTopics.API_REMOVED:
                this.gateway.removeApi(message.id);
                break;
            case ConfigTopics.API_ADDED:
            case ConfigTopics.API_UPDATED:
                this.gateway.updateApi(message.id);
                break;
            case ConfigTopics.MIDDLEWARE_ADDED:
            case ConfigTopics.MIDDLEWARE_UPDATED:
                this.gateway.middlewareInstaller.install(message.type, message.name);
                break;
            case ConfigTopics.MIDDLEWARE_REMOVED:
                this.gateway.middlewareInstaller.uninstall(message.type, message.name);
                break;
            default:
                this.gateway.logger.error(`Unknown event type ${eventTopic}: ${message}`);
        }
    }

    private loadProxy(apiConfig: ApiConfig): Promise<ApiConfig> {
        return new Promise((resolve, reject) => {
            this._proxyService.get(apiConfig.id)
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
            this._groupService.list(apiConfig.id)
                .then((groups) => {
                    if (groups && groups.length > 0) {
                        apiConfig.group = groups;
                    }

                    return this._throttlingService.list(apiConfig.id);
                })
                .then((throttling) => {
                    if (throttling && throttling.length > 0) {
                        apiConfig.throttling = throttling;
                    }

                    return this._circuitBreakerService.list(apiConfig.id);
                })
                .then((circuitBreaker) => {
                    if (circuitBreaker && circuitBreaker.length > 0) {
                        apiConfig.circuitBreaker = circuitBreaker;
                    }

                    return this._cacheService.list(apiConfig.id);
                })
                .then((cache) => {
                    if (cache && cache.length > 0) {
                        apiConfig.cache = cache;
                    }
                    return this._authService.get(apiConfig.id);
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