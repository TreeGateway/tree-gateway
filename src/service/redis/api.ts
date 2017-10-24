'use strict';

import * as uuid from 'uuid';
import { ApiService } from '../api';
import { NotFoundError, ValidationError } from '../../error/errors';
import { ApiConfig } from '../../config/api';
import { AutoWired, Singleton, Inject } from 'typescript-ioc';
import { Database } from '../../database';
import { ConfigTopics } from '../../config/events';

class Constants {
    static APIS_PREFIX = '{config}:apis';
    static ADMIN_API = 'ADMIN_API';
}

@AutoWired
@Singleton
export class RedisApiService implements ApiService {

    @Inject private database: Database;

    list(name?: string, version?: string | number, description?: string, path?: string): Promise<Array<ApiConfig>> {
        return new Promise((resolve, reject) => {
            this.database.redisClient.hgetall(Constants.APIS_PREFIX)
                .then((apis: any) => {
                    apis = Object.keys(apis).map((key: any) => JSON.parse(apis[key]));
                    apis = apis.filter((api: ApiConfig) => {
                        if (name && !api.name.includes(name)) {
                            return false;
                        }
                        if (version && api.version && !`${api.version}`.includes(`${version}`)) {
                            return false;
                        }
                        if (description && api.description && !api.description.includes(description)) {
                            return false;
                        }
                        if (path && api.path && !api.path.includes(path)) {
                            return false;
                        }
                        return true;
                    });

                    resolve(apis);
                })
                .catch(reject);
        });
    }

    get(id: string): Promise<ApiConfig> {
        return new Promise((resolve, reject) => {
            this.database.redisClient.hget(Constants.APIS_PREFIX, id)
                .then((api: string) => {
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
            if (!api.id) {
                api.id = uuid();
            }
            this.ensureAPICreateConstraints(api)
                .then(() =>
                    this.database.redisClient.multi()
                        .hmset(`${Constants.APIS_PREFIX}`, api.id, JSON.stringify(api))
                        .publish(ConfigTopics.CONFIG_UPDATED, JSON.stringify({ id: Constants.ADMIN_API }))
                        .exec()
                )
                .then(() => {
                    resolve(api.id);
                })
                .catch(error => {
                    if (typeof error === 'string') {
                        error = new ValidationError(error);
                    }
                    reject(error);
                });
        });
    }

    update(api: ApiConfig): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.ensureAPIUpdateConstraints(api)
                .then(() =>
                    this.database.redisClient.multi()
                        .hmset(`${Constants.APIS_PREFIX}`, api.id, JSON.stringify(api))
                        .publish(ConfigTopics.CONFIG_UPDATED, JSON.stringify({ id: api.id }))
                        .exec()
                )
                .then(() => {
                    resolve();
                })
                .catch(error => {
                    if (typeof error === 'string') {
                        error = new ValidationError(error);
                    }
                    reject(error);
                });
        });
    }

    remove(id: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            // TODO: remove children
            this.database.redisClient.multi()
                .hdel(`${Constants.APIS_PREFIX}`, id)
                .publish(ConfigTopics.CONFIG_UPDATED, JSON.stringify({ id: Constants.ADMIN_API }))
                .exec()
                .then((count: number) => {
                    // FIXME: multi() does not return count.
                    if (count === 0) {
                        throw new NotFoundError('Api not found.');
                    }

                    resolve();
                })
                .catch(reject);
        });
    }

    private ensureAPICreateConstraints(api: ApiConfig): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.database.redisClient.hexists(`${Constants.APIS_PREFIX}`, api.id)
                .then((exists: number) => {
                    if (exists) {
                        return reject(`Api ID ${api.id} already exists`);
                    }
                    return this.database.redisClient.hgetall(Constants.APIS_PREFIX);
                }).then((apis: any) => {
                    apis = Object.keys(apis).map((key: any) => JSON.parse(apis[key]));
                    let existingApi = apis.find((a: ApiConfig) => a.name === api.name && a.version === api.version);
                    if (existingApi) {
                        return reject(`Can not create this api ${api.name}:${api.version} already exists`);
                    }
                    existingApi = apis.find((a: ApiConfig) => a.path === api.path);
                    if (existingApi) {
                        return reject(`Can not create this api. Path ${api.path} already registered`);
                    }
                    resolve();
                }).catch(reject);
        });
    }

    private ensureAPIUpdateConstraints(api: ApiConfig): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.database.redisClient.hexists(`${Constants.APIS_PREFIX}`, api.id)
                .then((exists: number) => {
                    if (!exists) {
                        throw new NotFoundError(`Api not found: ${api.id}.`);
                    }
                    return this.database.redisClient.hgetall(Constants.APIS_PREFIX);
                }).then((apis: any) => {
                    apis = Object.keys(apis).map((key: any) => JSON.parse(apis[key]));
                    let existingApi = apis.find((a: ApiConfig) =>
                        (a.name === api.name && a.version === api.version) && a.id !== api.id);
                    if (existingApi) {
                        return reject(`Can not update this api to ${api.name}:${api.version}. This name conflicts with another existing API`);
                    }
                    existingApi = apis.find((a: ApiConfig) => a.path === api.path && a.id !== api.id);
                    if (existingApi) {
                        return reject(`Can not update this api. Path ${api.path} conflicts with another existing API`);
                    }
                    resolve();
                }).catch(reject);
        });
    }
}
