"use strict";

import * as express from "express";
import {ApiConfig} from "../config/api";
import {CacheConfig, ClientCacheConfig, ServerCacheConfig} from "../config/cache";
import * as serverCache from "./server-cache";
import {ClientCache} from "./client-cache";
import {Gateway} from "../gateway";
import * as Groups from "../group";

let onHeaders = require("on-headers");
let ServerCache = serverCache.ServerCache;

export class ApiCache {
    private gateway: Gateway;
    private serverCache: serverCache.ServerCache;

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
        let cache: CacheConfig = api.cache;
        let validateGroupFunction: Function;
        if (cache.group){
            if (this.gateway.logger.isDebugEnabled()) {
                let groups = Groups.filter(api.group, cache.group);
                this.gateway.logger.debug('Configuring Group filters for Cache on path [%s]. Groups [%s]', 
                    api.proxy.target.path, JSON.stringify(groups));
            }
            validateGroupFunction = Groups.buildGroupAllowFilter(api.group, cache.group);
        }
        let cacheMiddleware: express.RequestHandler = this.buildCacheMiddleware(validateGroupFunction, cache, path);        
        this.gateway.server.use(path, cacheMiddleware);
    }

    private buildCacheMiddleware(validateGroupFunction: Function, cache: CacheConfig, path: string): express.RequestHandler {
        let func = new Array<string>();
        func.push("function(req, res, next){");
        if (validateGroupFunction) {
            func.push("if (validateGroupFunction(req, res)){");
        }
        else {
            func.push("if (req.method === 'GET'){");
        }

        if (cache.client) {
            let clientCache: ClientCache = new ClientCache(this.gateway);
            func.push(clientCache.buildCacheMiddleware(cache.client, path));
        }
        if (cache.server) {
            let serverCache: serverCache.ServerCache = new ServerCache(this.gateway);
            func.push(serverCache.buildCacheMiddleware(cache.server, path, 'req', 'res', 'next'));
        }
        
        func.push("}");
        func.push("next();"); 
        func.push("}");
        let f: express.RequestHandler;
        eval('f = '+func.join(''))
        return f;
    }

    private useCache(api: ApiConfig) : boolean{
        if (api.cache && (api.cache.client || api.cache.server)){
            return true;
        }
        return false;
    }
}
