'use strict';

import * as express from 'express';
import * as _ from 'lodash';
import { AutoWired, Inject } from 'typescript-ioc';
import { ApiConfig } from '../../config/api';
import { ApiCacheConfig } from '../../config/cache';
import { ApiPipelineConfig } from '../../config/gateway';
import { Logger } from '../../logger';
import { createFunction } from '../../utils/functions';
import * as Groups from '../group';
import { RequestLogger } from '../stats/request';
import { ClientCache } from './client-cache';
import { ServerCache } from './server-cache';

const onHeaders = require('on-headers');

@AutoWired
export class ApiCache {
    @Inject private logger: Logger;
    @Inject private requestLogger: RequestLogger;

    public cache(apiRouter: express.Router, api: ApiConfig, pipelineConfig: ApiPipelineConfig) {
        if (this.useCache(api)) {
            this.configureCache(apiRouter, api, pipelineConfig);
        }
    }

    private configureCache(apiRouter: express.Router, api: ApiConfig, pipelineConfig: ApiPipelineConfig) {
        const path: string = api.path;
        const cacheConfigs: Array<ApiCacheConfig> = this.sortCaches(api.cache, path);

        cacheConfigs.forEach((cache: ApiCacheConfig) => {
            cache = this.resolveReferences(cache, pipelineConfig);
            let validateGroupFunction: Function;
            if (cache.group) {
                if (this.logger.isDebugEnabled()) {
                    const groups = Groups.filter(api.group, cache.group);
                    this.logger.debug(`Configuring Group filters for Cache on path [${api.path}]. Groups [${JSON.stringify(groups)}]`);
                }
                validateGroupFunction = Groups.buildGroupAllowFilter(api.group, cache.group);
            }
            try {
                const cacheMiddleware: express.RequestHandler = this.buildCacheMiddleware(validateGroupFunction, cache, path, api);
                apiRouter.use(cacheMiddleware);
            } catch (e) {
                this.logger.error(e);
            }
        });
    }

    private resolveReferences(cache: ApiCacheConfig, pipelineConfig: ApiPipelineConfig) {
        if (cache.use && pipelineConfig.cache) {
            if (pipelineConfig.cache[cache.use]) {
                cache = _.defaults(cache, pipelineConfig.cache[cache.use]);
            } else {
                throw new Error(`Invalid reference ${cache.use}. There is no configuration for this id.`);
            }
        }
        return cache;
    }

    private buildCacheMiddleware(validateGroupFunction: Function, cache: ApiCacheConfig, path: string, api: ApiConfig): express.RequestHandler {
        const body = new Array<string>();
        const requestLogEnabled = this.requestLogger.isRequestLogEnabled(api);
        if (validateGroupFunction) {
            body.push(`if (validateGroupFunction(req, res)){`);
        } else {
            body.push(`if (req.method === 'GET'){`);
        }

        if (cache.client) {
            const clientCache: ClientCache = new ClientCache();
            body.push(clientCache.buildCacheMiddleware(cache.client, path));
        }
        if (cache.server) {
            const serverCache: ServerCache = new ServerCache();

            if (requestLogEnabled) {
                body.push(serverCache.buildCacheMiddleware(cache.server, path, 'req', 'res', 'next', true));
            } else {
                body.push(serverCache.buildCacheMiddleware(cache.server, path, 'req', 'res', 'next'));
            }
        }

        body.push(`}`);
        body.push(`next();`);
        return createFunction({
            ServerCache: ServerCache,
            onHeaders: onHeaders,
            validateGroupFunction: validateGroupFunction
        }, 'req', 'res', 'next', body.join('')) as express.RequestHandler;
    }

    private useCache(api: ApiConfig): boolean {
        if (api.cache && api.cache.length > 0) {
            return true;
        }
        return false;
    }

    private sortCaches(caches: Array<ApiCacheConfig>, path: string): Array<ApiCacheConfig> {
        const generalCaches = _.filter(caches, (value: ApiCacheConfig) => !value.group);

        let groupsTemp: Array<string> = [];
        caches = caches
            .reverse()
            .map(cache => {
                cache.group = _.uniq(cache.group).filter((group: string) => {
                    const isGroupPresent = groupsTemp.indexOf(group) >= 0;
                    if (isGroupPresent) {
                        this.logger.warn(`Duplicated group cache configuration for api [${path}]. Conflicting configurations for group [${group}]. Kept last one.`);
                    }
                    return !isGroupPresent;
                });
                groupsTemp = groupsTemp.concat(cache.group);
                return cache;
            })
            .reverse();

        if (generalCaches.length > 1) {
            this.logger.error(`Invalid cache configuration for api [${path}]. Conflicting configurations for default group`);
            return [];
        }

        if (generalCaches.length > 0) {
            const index = caches.indexOf(generalCaches[0]);
            if (index < caches.length - 1) {
                const gen = caches.splice(index, 1);
                caches.push(gen[0]);
            }
        }
        return caches;
    }
}
