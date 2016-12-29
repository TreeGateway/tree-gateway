import {Redis} from "ioredis";

import {ApiService, ApiComponentService, GroupService, ThrottlingService,
    CacheService, ProxyService, AuthenticationService, ConfigService,
    NotFoundError, DuplicatedError} from "./api";

import {ApiConfig, createApiKey} from "../config/api";
import {CacheConfig} from "../config/cache";
import {ThrottlingConfig} from "../config/throttling";
import {Group} from "../config/group";
import {Proxy} from "../config/proxy";
import {AuthenticationConfig} from "../config/authentication";
import {ConfigTopics} from "../config/events";
import {Gateway} from "../gateway";

class Constants {
    static APIS_PREFIX = "config:apis";
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

    get(name: string, version: string): Promise<ApiConfig> {
        return this.getByKey(createApiKey(name, version));
    }

    getByKey(key: string): Promise<ApiConfig> {
        return new Promise((resolve, reject) => {
            this.redisClient.hget(Constants.APIS_PREFIX, key)
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
            const apiKey = createApiKey(api.name, api.version);

            this.redisClient.hexists(`${Constants.APIS_PREFIX}`, apiKey)
                .then((exists) => {
                    if (exists) {
                        throw new DuplicatedError(`Api ${apiKey} already exists`)
                    }

                    return this.redisClient.multi()
                               .hmset(`${Constants.APIS_PREFIX}`, apiKey, JSON.stringify(api))
                               .publish(ConfigTopics.API_ADDED, JSON.stringify({name: api.name, version: api.version}))
                               .exec()
                })
                .then(() => {
                    resolve(api.name);
                })
                .catch(reject);
        });
    }

    update(name: string, version: string, api: ApiConfig): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            api.name = name;
            api.version = version;

            const apiKey = createApiKey(name, version);

            this.redisClient.hexists(`${Constants.APIS_PREFIX}`, apiKey)
                .then((exists) => {
                    if (!exists) {
                        throw new NotFoundError('Api not found.');
                    }

                    return this.redisClient.multi()
                               .hmset(`${Constants.APIS_PREFIX}`, apiKey, JSON.stringify(api))
                               .publish(ConfigTopics.API_UPDATED, JSON.stringify({name, version}))
                               .exec();
                })
                .then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }

    remove(name: string, version: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const apiKey = createApiKey(name, version);

            // TODO: remove children
            this.redisClient.multi()
                .hdel(`${Constants.APIS_PREFIX}`, apiKey)
                .publish(ConfigTopics.API_REMOVED, JSON.stringify({name, version}))
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
    abstract getComponentKey(component: T): Promise<string>;

    abstract getMapName(): string;

    private getMapKey(apiName: string, apiVersion: string): string {
        return `${Constants.APIS_PREFIX}:${createApiKey(apiName, apiVersion)}:${this.getMapName()}`;
    }

    list(apiName: string, apiVersion: string): Promise<Array<T>> {
        return new Promise((resolve, reject) => {
            this.redisClient.hgetall(this.getMapKey(apiName, apiVersion))
                .then((items) => {
                    items = Object.keys(items).map(key => JSON.parse(items[key]));
                    resolve(items);
                })
                .catch(reject);
        });
    }

    get(apiName: string, apiVersion: string, componentId: string): Promise<T> {
        return new Promise((resolve, reject) => {
            this.redisClient.hget(this.getMapKey(apiName, apiVersion), componentId)
                .then((component) => {
                    if (!component) {
                        throw new NotFoundError('Component not found.');
                    }

                    resolve(JSON.parse(component));
                })
                .catch(reject);
        });
    }

    create(apiName: string, apiVersion: string, component: T): Promise<string> {
        return new Promise((resolve, reject) => {
            let location;

            this.getComponentKey(component)
                .then((key) => {
                    location = key;

                    return this.redisClient.multi()
                               .hmset(this.getMapKey(apiName, apiVersion), key, JSON.stringify(component))
                               .publish(ConfigTopics.API_UPDATED, JSON.stringify({name: apiName, version: apiVersion}))
                               .exec();
                })
                .then(() => {
                    resolve(location);
                })
                .catch(reject);
        });
    }

    update(apiName: string, apiVersion: string, componentId: string, component: T): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const mapKey = this.getMapKey(apiName, apiVersion);

            this.redisClient.hexists(mapKey, componentId)
                .then((exists) => {
                    if (!exists) {
                        throw new NotFoundError('Component not found.');
                    }

                    return this.redisClient.multi()
                               .hmset(mapKey, componentId, JSON.stringify(component))
                               .publish(ConfigTopics.API_UPDATED, JSON.stringify({name: apiName, version: apiVersion}))
                               .exec();
                })
                .then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }

    remove(apiName: string, apiVersion: string, componentId: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            return this.redisClient.multi()
                       .hdel(this.getMapKey(apiName, apiVersion), componentId)
                       .publish(ConfigTopics.API_UPDATED, JSON.stringify({name: apiName, version: apiVersion}))
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
    getComponentKey(group: Group): Promise<string> {
        return Promise.resolve(group.name);
    }

    getMapName(): string {
        return "groups";
    }
}

export class RedisThrottlingService extends RedisApiComponentService<ThrottlingConfig> implements ThrottlingService {
    getComponentKey(throttling: ThrottlingConfig): Promise<string> {
        return this.redisClient.incr(`${Constants.APIS_PREFIX}:throttlingSequence`);
    }

    getMapName(): string {
        return "throttling";
    }
}

export class RedisCacheService extends RedisApiComponentService<CacheConfig> implements CacheService {
    getComponentKey(cache: CacheConfig): Promise<string> {
        return this.redisClient.incr(`${Constants.APIS_PREFIX}:cacheSequence`);
    }

    getMapName(): string {
        return "cache";
    }
}

export class RedisProxyService extends RedisService implements ProxyService {

    get(apiName: string, apiVersion: string): Promise<Proxy> {
        return new Promise((resolve, reject) => {
            const apiKey = createApiKey(apiName, apiVersion);

            this.redisClient.get(`${Constants.APIS_PREFIX}:${apiKey}:proxy`)
                .then((proxy) => {
                    if (!proxy) {
                        throw new NotFoundError('Proxy not found.');
                    }

                    resolve(JSON.parse(proxy));
                })
                .catch(reject);
        });
    }

    create(apiName: string, apiVersion: string, proxy: Proxy): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const apiKey = createApiKey(apiName, apiVersion);

            this.redisClient.hexists(`${Constants.APIS_PREFIX}`, apiKey)
                .then((exists) => {
                    if (!exists) {
                        throw new NotFoundError('Api not found.');
                    }

                    return this.redisClient.multi()
                               .set(`${Constants.APIS_PREFIX}:${apiKey}:proxy`, JSON.stringify(proxy))
                               .publish(ConfigTopics.API_UPDATED, JSON.stringify({name: apiName, version: apiVersion}))
                               .exec();
                })
                .then(() => resolve())
                .catch(reject);
        });
    }

    update(apiName: string, apiVersion: string, proxy: Proxy): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const apiKey = createApiKey(apiName, apiVersion);

            const key = `${Constants.APIS_PREFIX}:${apiKey}:proxy`;

            this.redisClient.exists(key)
                .then((exists) => {
                    if (!exists) {
                        throw new NotFoundError('Proxy not found.');
                    }

                    return this.redisClient.multi()
                               .set(key, JSON.stringify(proxy))
                               .publish(ConfigTopics.API_UPDATED, JSON.stringify({name: apiName, version: apiVersion}))
                               .exec();
                })
                .then(() => resolve())
                .catch(reject);
        });
    }

    remove(apiName: string, apiVersion: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const apiKey = createApiKey(apiName, apiVersion);

            const key = `${Constants.APIS_PREFIX}:${apiKey}:proxy`;

            this.redisClient.exists(key)
                .then((exists) => {
                    if (!exists) {
                        throw new NotFoundError('Proxy not found.');
                    }

                    return this.redisClient.multi()
                               .del(key)
                               .publish(ConfigTopics.API_UPDATED, JSON.stringify({name: apiName, version: apiVersion}))
                               .exec();
                })
                .then(() => resolve())
                .catch(reject);
        });
    }
}

export class RedisAuthenticationService extends RedisService implements AuthenticationService {

    get(apiName: string, apiVersion: string): Promise<AuthenticationConfig> {
        return new Promise((resolve, reject) => {
            const apiKey = createApiKey(apiName, apiVersion);

            this.redisClient.get(`${Constants.APIS_PREFIX}:${apiKey}:authentication`)
                .then((auth) => {
                    if (!auth) {
                        throw new NotFoundError('Authentication config not found.');
                    }

                    resolve(JSON.parse(auth));
                })
                .catch(reject);
        });
    }

    create(apiName: string, apiVersion: string, auth: AuthenticationConfig): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const apiKey = createApiKey(apiName, apiVersion);

            this.redisClient.multi()
                .set(`${Constants.APIS_PREFIX}:${apiKey}:authentication`, JSON.stringify(auth))
                .publish(ConfigTopics.API_UPDATED, JSON.stringify({name: apiName, version: apiVersion}))
                .exec()
                .then(() => resolve())
                .catch(reject);
        });
    }

    update(apiName: string, apiVersion: string, auth: AuthenticationConfig): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const apiKey = createApiKey(apiName, apiVersion);

            const key = `${Constants.APIS_PREFIX}:${apiKey}:authentication`;

            this.redisClient.exists(key)
                .then((exists) => {
                    if (!exists) {
                        throw new NotFoundError('Authentication config not found.');
                    }

                    return this.redisClient.multi()
                               .set(key, JSON.stringify(auth))
                               .publish(ConfigTopics.API_UPDATED, JSON.stringify({name: apiName, version: apiVersion}))
                               .exec();
                })
                .then(() => resolve())
                .catch(reject);
        });
    }

    remove(apiName: string, apiVersion: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const apiKey = createApiKey(apiName, apiVersion);

            this.redisClient.multi()
                .del(`${Constants.APIS_PREFIX}:${apiKey}:authentication`)
                .publish(ConfigTopics.API_UPDATED, JSON.stringify({name: apiName, version: apiVersion}))
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
    private _cacheService: CacheService;
    private _authService: AuthenticationService;
    private gateway: Gateway;

    constructor(gateway: Gateway) {
        super(gateway.redisClient);
        this._apiService = new RedisApiService(gateway.redisClient);
        this._proxyService = new RedisProxyService(gateway.redisClient);
        this._groupService = new RedisGroupService(gateway.redisClient);
        this._throttlingService = new RedisThrottlingService(gateway.redisClient);
        this._cacheService = new RedisCacheService(gateway.redisClient);
        this._authService = new RedisAuthenticationService(gateway.redisClient);
        this.gateway = gateway;
    }

    getApiConfig(apiName: string, apiVersion: string): Promise<ApiConfig> {
        return new Promise<ApiConfig>((resolve, reject) => {
            this._apiService.get(apiName, apiVersion)
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
                this.gateway.removeApi(message.name, message.version);
                break;
            case ConfigTopics.API_ADDED:
            case ConfigTopics.API_UPDATED:
                this.gateway.updateApi(message.name, message.version);
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
            this._proxyService.get(apiConfig.name, apiConfig.version)
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
            this._groupService.list(apiConfig.name, apiConfig.version)
                .then((groups) => {
                    apiConfig.group = groups;
                    return this._throttlingService.list(apiConfig.name, apiConfig.version);
                })
                .then((throttling) => {
                    apiConfig.throttling = throttling;
                    return this._cacheService.list(apiConfig.name, apiConfig.version);
                })
                .then((cache) => {
                    apiConfig.cache = cache;
                    return this._authService.get(apiConfig.name, apiConfig.version);
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