"use strict";

import {CacheEntry, CacheStore} from "./cache-store";
import {Gateway} from "../gateway";
import {ServerCacheConfig} from "../config/cache";
import {calculateSeconds} from "./cache-time";
import {MemoryStore} from "./memory-store";

export class ServerCache {
    static cacheStore: CacheStore<CacheEntry>;
    private gateway: Gateway;
    
    constructor(gateway: Gateway) {
        this.gateway = gateway;
        if (!ServerCache.cacheStore) {
            this.initializeCacheStore()
        }
    }

    private initializeCacheStore() {
        if (this.gateway.redisClient) {
            let store = require('./store');
            if (this.gateway.logger.isDebugEnabled()) {
                this.gateway.logger.debug("Using Redis as cache store.");
            }
        }
        else {
            ServerCache.cacheStore = new MemoryStore({

            })
        }
    }

    buildCacheMiddleware(serverCache: ServerCacheConfig, path: string, req, res, next){
        let result = new Array<string>();
        result.push('ServerCache.cacheStore.get('+req+'.originalUrl, function(err, entry){');
        result.push('if (err) {');
        result.push('return '+next+'();');
        result.push('}');
        result.push('if (entry) {');
        // cache hit
        result.push(res+'.contentType(entry.mimeType || "text/html");');
        if(serverCache.binary){
            result.push(res+'.send(new Buffer(entry.content, "base64"));');
        }
        else{
            result.push(res+'.send(entry.content);');
        }
        result.push('}');
        result.push('else {');
        // cache miss
        result.push('var send = '+res+'.send.bind('+res+');');
        result.push(res+'.send = function (body) {');
        result.push('var ret = send(body);');
        if (serverCache.binary) {
            result.push('body = new Buffer(body).toString("base64");');
        }
        result.push('if ( typeof body !== "string" ) {');
        result.push('return ret;');
        result.push('}');

        let cacheTime = calculateSeconds(serverCache.cacheTime)*1000;
        result.push('ServerCache.cacheStore.set('+req+'.originalUrl, {');
        result.push('content: body,');
        result.push('mimeType: this._headers["content-type"]');
        result.push('}, '+cacheTime+');');

        result.push('return ret;');
        result.push('};');
        result.push('return '+next+'();');
        // end cache miss

        result.push('}');
        result.push('});');
        result.push('return;');
        return result.join('');
    }
}

