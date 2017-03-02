"use strict";

import {Gateway} from "../gateway";
import {ClientCacheConfig} from "../config/cache";
import * as _ from "lodash";
import * as humanInterval from "human-interval";
import {Logger} from "../logger";
import {AutoWired, Inject} from "typescript-ioc";

@AutoWired
export class ClientCache {
    @Inject
    private logger: Logger;

    buildCacheMiddleware(clientCache: ClientCacheConfig, path: string){
        let func = new Array<string>();
        let cacheControl: string = this.cacheHeaderString(clientCache);
        if (this.logger.isDebugEnabled()) {
            this.logger.debug(`Configuring Client Cache for path [${path}].`);
        }
        func.push(`onHeaders(res, function(){`);
        func.push(`res.set('Cache-Control', '${cacheControl}');`);
        func.push(`});`);
        return func.join('');
    }

    private cacheHeaderString(cache: ClientCacheConfig): string {
        let cacheConfig = _.defaults(cache, {
            cacheControl: 'public', 
            cacheTime: '0'
        });
        
        let cacheTime = (humanInterval(cache.cacheTime) / 1000);
        let result = new Array<string>();
        
        if (cacheTime > 0) {
            result.push(cache.cacheControl);
            if (cache.mustRevalidate) {
                result.push(`,must-revalidate`);
            }
            if (cache.noTransform) {
                result.push(`,no-transform`);
            }
            if (cache.proxyRevalidate) {
                result.push(`,proxy-revalidate`);
            }
            if (cache.cacheControl !== `no-store`) {
                result.push(`,max-age=${cacheTime}`);
            }
        }
        else {
            result.push(`no-store`);
        }

        return result.join('');
    }
}