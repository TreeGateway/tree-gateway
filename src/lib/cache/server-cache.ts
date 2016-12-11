"use strict";

import {CacheEntry, CacheStore} from "./cache-store";
import {Gateway} from "../gateway";
import {ServerCacheConfig} from "../config/cache";
import {calculateSeconds} from "../utils/time";
import {MemoryStore} from "./memory-store";
import * as StringUtils from "underscore.string";

export class ServerCache {
    static cacheStore: CacheStore<CacheEntry>;
    private gateway: Gateway;
    
    constructor(gateway: Gateway) {
        this.gateway = gateway;
        if (!ServerCache.cacheStore) {
            this.initializeCacheStore();
        }
    }

    private initializeCacheStore() {
        if (this.gateway.redisClient) {
            let store = require('./redis-store');
            if (this.gateway.logger.isDebugEnabled()) {
                this.gateway.logger.debug("Using Redis as cache store.");
            }
            ServerCache.cacheStore = new store.RedisStore({
                client: this.gateway.redisClient
            });            
        }
        else {
            ServerCache.cacheStore = new MemoryStore({

            });
        }
    }

    buildCacheMiddleware(serverCache: ServerCacheConfig, path: string, req: string, res: string, 
                         next: string, stats?: string){
        if (this.gateway.logger.isDebugEnabled()) {
            this.gateway.logger.debug('Configuring Server Cache for path [%s].', path);
        }
        let result = new Array<string>();
        result.push('ServerCache.cacheStore.get('+req+'.originalUrl, function(err, entry){');
        result.push('if (err) {');
        if (stats) {
            result.push('stats.cacheError.registerOccurrence('+req+'.path);');
        }
        result.push('return '+next+'();');
        result.push('}');
        result.push('if (entry) {');
        // cache hit
        if (stats) {
            result.push('stats.cacheHit.registerOccurrence('+req+'.path);');
        }
        result.push(res+'.contentType(entry.mimeType || "text/html");');
        if (serverCache.preserveHeaders) {
            serverCache.preserveHeaders.forEach((header)=>{
                result.push(res+'.set('+StringUtils.quote(header)+', entry.header['+StringUtils.quote(header)+']);');
            });
        }
        if(serverCache.binary){
            result.push(res+'.send(new Buffer(entry.content, "base64"));');
        }
        else{
            result.push(res+'.send(entry.content);');
        }
        result.push('}');
        result.push('else {');
        // cache miss
        if (stats) {
            result.push('stats.cacheMiss.registerOccurrence('+req+'.path);');
        }
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
        if (serverCache.preserveHeaders) {
            result.push(',header: {');
            serverCache.preserveHeaders.forEach((header, index)=>{
                if (index > 0) {
                    result.push(',');        
                }
                result.push(StringUtils.quote(header)+': this._headers['+StringUtils.quote(header)+']');
            });
            result.push('}');
        }
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

