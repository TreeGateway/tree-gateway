'use strict';

import { ClientCacheConfig } from '../config/cache';
import * as _ from 'lodash';
import { Logger } from '../logger';
import { AutoWired, Inject } from 'typescript-ioc';
import {getMilisecondsInterval} from '../utils/time-intervals';

@AutoWired
export class ClientCache {
    @Inject
    private logger: Logger;

    buildCacheMiddleware(clientCache: ClientCacheConfig, path: string) {
        const func = new Array<string>();
        const cacheControl: string = this.cacheHeaderString(clientCache);
        if (this.logger.isDebugEnabled()) {
            this.logger.debug(`Configuring Client Cache for path [${path}].`);
        }
        func.push(`onHeaders(res, function(){`);
        func.push(`res.set('Cache-Control', '${cacheControl}');`);
        func.push(`});`);
        return func.join('');
    }

    private cacheHeaderString(cache: ClientCacheConfig): string {
        const cacheConfig = _.defaults(cache, {
            cacheControl: 'public',
            cacheTime: '0'
        });

        const cacheTime = (getMilisecondsInterval(cacheConfig.cacheTime) / 1000);
        const result = new Array<string>();

        if (cacheTime > 0) {
            result.push(cacheConfig.cacheControl);
            if (cacheConfig.mustRevalidate) {
                result.push(`,must-revalidate`);
            }
            if (cacheConfig.noTransform) {
                result.push(`,no-transform`);
            }
            if (cacheConfig.proxyRevalidate) {
                result.push(`,proxy-revalidate`);
            }
            if (cacheConfig.cacheControl !== `no-store`) {
                result.push(`,max-age=${cacheTime}`);
            }
        } else {
            result.push(`no-store`);
        }

        return result.join('');
    }
}
