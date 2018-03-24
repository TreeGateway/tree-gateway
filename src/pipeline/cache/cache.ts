'use strict';

import * as express from 'express';
import { ApiConfig } from '../../config/api';
import { ApiPipelineConfig } from '../../config/gateway';
import { ApiCacheConfig } from '../../config/cache';
import { ServerCache } from './server-cache';
import { ClientCache } from './client-cache';
import * as Groups from '../group';
import * as _ from 'lodash';
import { Logger } from '../../logger';
import { AutoWired, Inject } from 'typescript-ioc';
import { createFunction } from '../../utils/functions';
import { RequestLogger } from '../stats/request';

const onHeaders = require('on-headers');

@AutoWired
export class ApiCache {
    @Inject private logger: Logger;
    @Inject private requestLogger: RequestLogger;

    cache(apiRouter: express.Router, api: ApiConfig, pipelineConfig: ApiPipelineConfig) {
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
        return <express.RequestHandler>createFunction({
            ServerCache: ServerCache,
            onHeaders: onHeaders,
            validateGroupFunction: validateGroupFunction
        }, 'req', 'res', 'next', body.join(''));
    }

    private useCache(api: ApiConfig): boolean {
        if (api.cache && api.cache.length > 0) {
            return true;
        }
        return false;
    }

    private sortCaches(caches: Array<ApiCacheConfig>, path: string): Array<ApiCacheConfig> {
        const generalCaches = _.filter(caches, (value) => {
            if (value.group) {
                return true;
            }
            return false;
        });

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
