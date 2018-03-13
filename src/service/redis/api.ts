'use strict';

import { ObjectID } from 'bson';
import { ApiService } from '../api';
import { ValidationError } from '../../config/errors';
import { NotFoundError } from '../../pipeline/error/errors';
import { ApiConfig } from '../../config/api';
import { AutoWired, Singleton, Inject } from 'typescript-ioc';
import { Database } from '../../database';
import { ConfigTopics } from '../../config/events';
import { castArray } from '../../utils/config';
import * as _ from 'lodash';

class Constants {
    static APIS_PREFIX = '{config}:apis';
    static ADMIN_API = 'ADMIN_API';
}

@AutoWired
@Singleton
export class RedisApiService implements ApiService {

    @Inject private database: Database;

    async list(name?: string, version?: string | number, description?: string, path?: string): Promise<Array<ApiConfig>> {
        let apis = await this.database.redisClient.hgetall(Constants.APIS_PREFIX);
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

        return apis;
    }

    async get(id: string): Promise<ApiConfig> {
        const api = await this.database.redisClient.hget(Constants.APIS_PREFIX, id);
        if (!api) {
            throw new NotFoundError('Api not found.');
        }

        return JSON.parse(api);
    }

    async create(api: ApiConfig): Promise<string> {
        try {
            if (!api.id) {
                api.id = new ObjectID().toString();
            }
            this.castArrays(api);
            await this.ensureAPICreateConstraints(api);
            await this.database.redisClient.multi()
                    .hmset(`${Constants.APIS_PREFIX}`, api.id, JSON.stringify(api))
                    .publish(ConfigTopics.CONFIG_UPDATED, JSON.stringify({ packageId: Constants.ADMIN_API }))
                    .exec();
            return api.id;
        } catch (err) {
            if (typeof err === 'string') {
                err = new ValidationError(err);
            }
            throw err;
        }
    }

    async update(api: ApiConfig, upsert?: boolean): Promise<void> {
        try {
            if (upsert && !api.id) {
                api.id = new ObjectID().toString();
            }
            this.castArrays(api);
            await this.ensureAPIUpdateConstraints(api, upsert);
            await this.database.redisClient.multi()
                    .hmset(`${Constants.APIS_PREFIX}`, api.id, JSON.stringify(api))
                    .publish(ConfigTopics.CONFIG_UPDATED, JSON.stringify({ packageId: Constants.ADMIN_API, id: api.id }))
                    .exec();
        } catch (err) {
            if (typeof err === 'string') {
                err = new ValidationError(err);
            }
            throw err;
        }
    }

    async remove(id: string): Promise<void> {
        await this.database.redisClient.multi()
            .hdel(`${Constants.APIS_PREFIX}`, id)
            .publish(ConfigTopics.CONFIG_UPDATED, JSON.stringify({ packageId: Constants.ADMIN_API }))
            .exec();
    }

    private async ensureAPICreateConstraints(api: ApiConfig): Promise<void> {
        const exists = await this.database.redisClient.hexists(`${Constants.APIS_PREFIX}`, api.id);
        if (exists) {
            throw new ValidationError(`Api ID ${api.id} already exists`);
        }
        let apis = await this.database.redisClient.hgetall(Constants.APIS_PREFIX);
        apis = Object.keys(apis).map((key: any) => JSON.parse(apis[key]));
        let existingApi = apis.find((a: ApiConfig) => a.name === api.name && a.version === api.version);
        if (existingApi) {
            throw new ValidationError(`Can not create this api ${api.name}:${api.version} already exists`);
        }
        existingApi = apis.find((a: ApiConfig) => a.path === api.path);
        if (existingApi) {
            throw new ValidationError(`Can not create this api. Path ${api.path} already registered`);
        }
    }

    private async ensureAPIUpdateConstraints(api: ApiConfig, upsert?: boolean): Promise<void> {
        const exists = await this.database.redisClient.hexists(`${Constants.APIS_PREFIX}`, api.id);
        if (!upsert && !exists) {
            throw new NotFoundError(`Api not found: ${api.id}.`);
        }
        let apis = await this.database.redisClient.hgetall(Constants.APIS_PREFIX);
        apis = Object.keys(apis).map((key: any) => JSON.parse(apis[key]));
        let existingApi = apis.find((a: ApiConfig) =>
            (a.name === api.name && a.version === api.version) && a.id !== api.id);
        if (existingApi) {
            throw new ValidationError(`Can not update this api to ${api.name}:${api.version}. This name conflicts with another existing API (${existingApi.id})`);
        }
        existingApi = apis.find((a: ApiConfig) => a.path === api.path && a.id !== api.id);
        if (existingApi) {
            throw new ValidationError(`Can not update this api. Path ${api.path} conflicts with another existing API`);
        }
    }

    /**
     * This function cast all array properties inside api configuration to array.
     * It is used to allow user to configure array properties as a single item too.
     * @param api API configuration
     */
    private castArrays(api: ApiConfig) {
        if (_.has(api, 'group')) {
            castArray(api, 'group');
            api.group.forEach(config => {
                castArray(config, 'member');
                config.member.forEach(member => {
                    castArray(member, 'method');
                    castArray(member, 'path');
                    castArray(member, 'protocol');
                });
            });
        }
        castArray(api, 'proxy.target.allow');
        castArray(api, 'proxy.target.deny');
        if (_.has(api, 'authentication')) {
            castArray(api, 'authentication');
            api.authentication.forEach(config => castArray(config, 'group'));
        }
        if (_.has(api, 'cache')) {
            castArray(api, 'cache');
            api.cache.forEach(config => {
                castArray(config, 'group');
                castArray(config, 'server.preserveHeaders');
            });
        }
        if (_.has(api, 'throttling')) {
            castArray(api, 'throttling');
            api.throttling.forEach(config => castArray(config, 'group'));
        }
        if (_.has(api, 'circuitBreaker')) {
            castArray(api, 'circuitBreaker');
            api.circuitBreaker.forEach(config => castArray(config, 'group'));
        }
        if (_.has(api, 'cors')) {
            castArray(api, 'cors');
            api.cors.forEach(config => {
                castArray(config, 'allowedHeaders');
                castArray(config, 'exposedHeaders');
                castArray(config, 'method');
                castArray(config, 'group');
            });
        }
        if (_.has(api, 'filter')) {
            castArray(api, 'filter');
            api.filter.forEach(config => castArray(config, 'group'));
        }
        if (_.has(api, 'interceptor.request')) {
            castArray(api, 'interceptor.request');
            api.interceptor.request.forEach(interceptor => castArray(interceptor, 'group'));
        }
        if (_.has(api, 'interceptor.response')) {
            castArray(api, 'interceptor.response');
            api.interceptor.response.forEach(interceptor => castArray(interceptor, 'group'));
        }
    }
}
