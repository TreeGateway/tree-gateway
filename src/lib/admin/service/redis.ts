import {Redis} from "ioredis";

import {ApiService, ApiComponentService, GroupService, ThrottlingService,
    CacheService, ProxyService, NotFoundError} from "./api";

import {ApiConfig} from "../../config/api";
import {CacheConfig} from "../../config/cache";
import {ThrottlingConfig} from "../../config/throttling";
import {Group} from "../../config/group";
import {Proxy} from "../../config/proxy";

class Constants {
    static CONFIG_EVENTS_TOPIC = "configEvents";
    static APIS_PREFIX = "config:apis";
}

export class RedisService {
    protected redisClient:Redis;

    constructor(redisClient) {
        this.redisClient = redisClient;
    }

    publishEvent(eventType: string, payload: any): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const event = {
                type: eventType,
                payload: payload
            };

            this.redisClient.publish(Constants.CONFIG_EVENTS_TOPIC, JSON.stringify(event))
                .then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }
}

export class RedisApiService implements ApiService {
    private redisClient:Redis;

    constructor(redisClient) {
        this.redisClient = redisClient;
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

    get(name: string): Promise<ApiConfig> {
        return new Promise((resolve, reject) => {
            this.redisClient.hget(Constants.APIS_PREFIX, name)
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
            this.redisClient.hmset(`${Constants.APIS_PREFIX}`, api.name, JSON.stringify(api))
                .then(() => {
                    resolve(api.name);
                })
                .catch(reject);
        });
    }

    update(name: string, api: ApiConfig): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            api.name = name;
            this.redisClient.hexists(`${Constants.APIS_PREFIX}`, api.name)
                .then((exists) => {
                    if (!exists) {
                        throw new NotFoundError('Api not found.');
                    }

                    return this.redisClient.hmset(`${Constants.APIS_PREFIX}`, api.name, JSON.stringify(api));
                })
                .then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }

    remove(name: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.redisClient.hdel(`${Constants.APIS_PREFIX}`, name)
                .then((count) => {
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

    private getMapKey(apiName: string): string {
        return `${Constants.APIS_PREFIX}:${apiName}:${this.getMapName()}`;
    }

    list(apiName: string): Promise<Array<T>> {
        return new Promise((resolve, reject) => {
            this.redisClient.hgetall(this.getMapKey(apiName))
                .then((items) => {
                    items = Object.keys(items).map(key => JSON.parse(items[key]));
                    resolve(items);
                })
                .catch(reject);
        });
    }

    get(apiName: string, componentId: string): Promise<T> {
        return new Promise((resolve, reject) => {
            this.redisClient.hget(this.getMapKey(apiName), componentId)
                .then((component) => {
                    if (!component) {
                        throw new NotFoundError('Component not found.');
                    }

                    resolve(JSON.parse(component));
                })
                .catch(reject);
        });
    }

    create(apiName: string, component: T): Promise<string> {
        return new Promise((resolve, reject) => {
            let location;

            this.getComponentKey(component)
                .then((key) => {
                    location = key;
                    return this.redisClient.hmset(this.getMapKey(apiName), key, JSON.stringify(component));
                })
                .then(() => {
                    resolve(location);
                })
                .catch(reject);
        });
    }

    update(apiName: string, componentId: string, component: T): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const mapKey = this.getMapKey(apiName);

            this.redisClient.hexists(mapKey, componentId)
                .then((exists) => {
                    if (!exists) {
                        throw new NotFoundError('Component not found.');
                    }

                    return this.redisClient.hmset(mapKey, componentId, JSON.stringify(component));
                })
                .then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }

    remove(apiName: string, componentId: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.redisClient.hdel(this.getMapKey(apiName), componentId)
                .then((count) => {
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

    get(apiName: string): Promise<Proxy> {
        return new Promise((resolve, reject) => {
            this.redisClient.get(`${Constants.APIS_PREFIX}:${apiName}:proxy`)
                .then((proxy) => {
                    if (!proxy) {
                        throw new NotFoundError('Proxy not found.');
                    }

                    resolve(JSON.parse(proxy));
                })
                .catch(reject);
        });
    }

    create(apiName: string, proxy: Proxy): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.redisClient.set(`${Constants.APIS_PREFIX}:${apiName}:proxy`, JSON.stringify(proxy))
                .then(() => resolve())
                .catch(reject);
        });
    }

    update(apiName: string, proxy: Proxy): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const key = `${Constants.APIS_PREFIX}:${apiName}:proxy`;

            this.redisClient.exists(key)
                .then((exists) => {
                    if (!exists) {
                        throw new NotFoundError('Proxy not found.');
                    }

                    return this.redisClient.set(key, JSON.stringify(proxy));
                })
                .then(() => resolve())
                .catch(reject);
        });
    }

    remove(apiName: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.redisClient.del(`${Constants.APIS_PREFIX}:${apiName}:proxy`)
                .then((count) => {
                    if (count === 0) {
                        throw new NotFoundError('Proxy not found.');
                    }

                    resolve();
                })
                .catch(reject);
        });
    }
}