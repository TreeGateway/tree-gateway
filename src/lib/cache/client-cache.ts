"use strict";

import {Gateway} from "../gateway";
import {ClientCacheConfig} from "../config/cache";
import {calculateSeconds} from "../utils/time";

let defaults = require('defaults');

export class ClientCache {
    private gateway: Gateway;

    constructor(gateway: Gateway) {
        this.gateway = gateway;
    }

    buildCacheMiddleware(clientCache: ClientCacheConfig, path: string){
        let func = new Array<string>();
        let cacheControl: string = this.cacheHeaderString(clientCache);
        if (this.gateway.logger.isDebugEnabled()) {
            this.gateway.logger.debug('Configuring Client Cache for path [%s].', path);
        }
        func.push("onHeaders(res, function(){");
        func.push("res.set('Cache-Control', '"+cacheControl+"');");
        func.push("});");
        return func.join('');
    }

    private cacheHeaderString(cache: ClientCacheConfig): string {
        let cacheConfig = defaults(cache, {
            cacheControl: 'public', 
            cacheTime: '0'
        });
        
        let cacheTime = calculateSeconds(cache.cacheTime);
        let result = new Array<string>();
        
        if (cacheTime > 0) {
            result.push(cache.cacheControl);
            if (cache.mustRevalidate) {
                result.push(',must-revalidate');
            }
            if (cache.noTransform) {
                result.push(',no-transform');
            }
            if (cache.proxyRevalidate) {
                result.push(',proxy-revalidate');
            }
            if (cache.cacheControl !== 'no-store') {
                result.push(',max-age='+cacheTime);
            }
        }
        else {
            result.push('no-store');
        }

        return result.join('');
    }
}