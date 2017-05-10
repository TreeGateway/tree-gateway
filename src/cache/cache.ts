'use strict';

import * as express from 'express';
import { ApiConfig } from '../config/api';
import { CacheConfig, ServerCacheConfig } from '../config/cache';
import * as serverCache from './server-cache';
import { ClientCache } from './client-cache';
import * as Groups from '../group';
import * as _ from 'lodash';
import { Stats } from '../stats/stats';
import { Logger } from '../logger';
import { AutoWired, Inject } from 'typescript-ioc';
import { StatsRecorder } from '../stats/stats-recorder';
import { createFunction } from '../utils/functions';

const onHeaders = require('on-headers');
const ServerCache = serverCache.ServerCache;

class StatsController {
    cacheError: Stats;
    cacheHit: Stats;
    cacheMiss: Stats;
}

@AutoWired
export class ApiCache {
    @Inject
    private logger: Logger;
    @Inject
    private statsRecorder: StatsRecorder;

    cache(apiRouter: express.Router, api: ApiConfig) {
        if (this.useCache(api)) {
            this.configureCache(apiRouter, api);
        }
    }

    private configureCache(apiRouter: express.Router, api: ApiConfig) {
        const path: string = api.path;
        const cacheConfigs: Array<CacheConfig> = this.sortCaches(api.cache, path);

        cacheConfigs.forEach((cache: CacheConfig) => {
            let validateGroupFunction: Function;
            if (cache.group) {
                if (this.logger.isDebugEnabled()) {
                    const groups = Groups.filter(api.group, cache.group);
                    this.logger.debug(`Configuring Group filters for Cache on path [${api.path}]. Groups [${JSON.stringify(groups)}]`);
                }
                validateGroupFunction = Groups.buildGroupAllowFilter(api.group, cache.group);
            }
            try {
                const cacheMiddleware: express.RequestHandler = this.buildCacheMiddleware(validateGroupFunction, cache, path);
                apiRouter.use(cacheMiddleware);
            } catch (e) {
                this.logger.error(e);
            }
        });
    }

    private buildCacheMiddleware(validateGroupFunction: Function, cache: CacheConfig, path: string): express.RequestHandler {
        const body = new Array<string>();
        const stats = this.createCacheStats(path, cache.server);
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
            const serverCache: serverCache.ServerCache = new ServerCache();

            if (stats) {
                body.push(serverCache.buildCacheMiddleware(cache.server, path, 'req', 'res', 'next', 'stats'));
            } else {
                body.push(serverCache.buildCacheMiddleware(cache.server, path, 'req', 'res', 'next'));
            }
        }

        body.push(`}`);
        body.push(`next();`);
        return <express.RequestHandler>createFunction({
            ServerCache: ServerCache,
            onHeaders: onHeaders,
            stats: stats,
            validateGroupFunction: validateGroupFunction
        }, 'req', 'res', 'next', body.join(''));
    }

    private useCache(api: ApiConfig): boolean {
        if (api.cache && api.cache.length > 0) {
            return true;
        }
        return false;
    }

    private sortCaches(caches: Array<CacheConfig>, path: string): Array<CacheConfig> {
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

    private createCacheStats(path: string, serverCache: ServerCacheConfig): StatsController {
        if (!serverCache.disableStats) {
            const stats: StatsController = new StatsController();
            stats.cacheError = this.statsRecorder.createStats(Stats.getStatsKey('cache', path, 'error'), serverCache.statsConfig);
            stats.cacheHit = this.statsRecorder.createStats(Stats.getStatsKey('cache', path, 'hit'), serverCache.statsConfig);
            stats.cacheMiss = this.statsRecorder.createStats(Stats.getStatsKey('cache', path, 'miss'), serverCache.statsConfig);

            if (stats.cacheMiss) {
                return stats;
            }
        }

        return null;
    }
}
