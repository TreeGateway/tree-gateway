"use strict";

import * as express from "express";
import {ApiConfig} from "../config/api";
import {CacheConfig, ClientCacheConfig, ServerCacheConfig} from "../config/cache";
import * as serverCache from "./server-cache";
import {ClientCache} from "./client-cache";
import {Gateway} from "../gateway";
import * as Groups from "../group";
import * as Utils from "underscore";
import {Stats} from "../stats/stats";

let onHeaders = require("on-headers");
let ServerCache = serverCache.ServerCache;

class StatsController {
    cacheError: Stats;
    cacheHit: Stats;
    cacheMiss: Stats;
}

export class ApiCache {
    private gateway: Gateway;

    constructor(gateway: Gateway) {
        this.gateway = gateway;
    }

    cache(api: ApiConfig) {
        if (this.useCache(api)) {
            this.configureCache(api);
        }
    }

    private configureCache(api: ApiConfig) {
        let path: string = api.proxy.path;
        let cacheConfigs: Array<CacheConfig> = this.sortCaches(api.cache, path);

        cacheConfigs.forEach((cache: CacheConfig)=>{
            let validateGroupFunction: Function;
            if (cache.group){
                if (this.gateway.logger.isDebugEnabled()) {
                    let groups = Groups.filter(api.group, cache.group);
                    this.gateway.logger.debug(`Configuring Group filters for Cache on path [${api.proxy.target.path}]. Groups [${JSON.stringify(groups)}]`);
                }
                validateGroupFunction = Groups.buildGroupAllowFilter(api.group, cache.group);
            }
            try{
                let cacheMiddleware: express.RequestHandler = this.buildCacheMiddleware(validateGroupFunction, cache, path);        
                this.gateway.server.use(path, cacheMiddleware);
            } catch (e) {
                this.gateway.logger.error(e);
            }
        });
    }

    private buildCacheMiddleware(validateGroupFunction: Function, cache: CacheConfig, path: string): express.RequestHandler {
        let func = new Array<string>();
        let stats = this.createCacheStats(path, cache.server);
        func.push(`function(req, res, next){`);
        if (validateGroupFunction) {
            func.push(`if (validateGroupFunction(req, res)){`);
        }
        else {
            func.push(`if (req.method === 'GET'){`);
        }

        if (cache.client) {
            let clientCache: ClientCache = new ClientCache(this.gateway);
            func.push(clientCache.buildCacheMiddleware(cache.client, path));
        }
        if (cache.server) {
            let serverCache: serverCache.ServerCache = new ServerCache(this.gateway);

            if (stats) {
                func.push(serverCache.buildCacheMiddleware(cache.server, path, 'req', 'res', 'next', 'stats'));
            }
            else{
                func.push(serverCache.buildCacheMiddleware(cache.server, path, 'req', 'res', 'next'));
            }
        }
        
        func.push(`}`);
        func.push(`next();`); 
        func.push(`}`);
        let f: express.RequestHandler;
        eval(`f = ${func.join('')}`);
        return f;
    }

    private useCache(api: ApiConfig) : boolean{
        if (api.cache && api.cache.length > 0){
            return true;
        }
        return false;
    }

    private sortCaches(caches: Array<CacheConfig>, path: string): Array<CacheConfig> {
        let generalCaches = Utils.filter(caches, (value)=>{
            if (value.group) {
                return true;
            }
            return false;
        });
        
        if (generalCaches.length > 1) {
            this.gateway.logger.error(`Invalid cache configuration for api [${path}]. Conflicting configurations for default group`);
                return [];
        }

        if (generalCaches.length > 0) {
            let index = caches.indexOf(generalCaches[0]);
            if (index < caches.length -1) {
                let gen = caches.splice(index, 1);
                caches.push(gen)   
            }
        }
        return caches;
    }

    private createCacheStats(path: string, serverCache: ServerCacheConfig) : StatsController {
        if ((!serverCache.disableStats) && (this.gateway.statsConfig)) {
            let stats: StatsController = new StatsController();
            stats.cacheError = this.gateway.createStats(Stats.getStatsKey('cache', 'error', path));
            stats.cacheHit = this.gateway.createStats(Stats.getStatsKey('cache', 'hit', path));
            stats.cacheMiss = this.gateway.createStats(Stats.getStatsKey('cache', 'miss', path));
            
            return stats;
        }

        return null;
    }
}
