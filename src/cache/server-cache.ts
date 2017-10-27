'use strict';

import { CacheEntry, CacheStore } from './cache-store';
import { ServerCacheConfig } from '../config/cache';
import { RedisStore } from './redis-store';
import { Logger } from '../logger';
import { Inject } from 'typescript-ioc';
import { Database } from '../database';
import { getMilisecondsInterval } from '../utils/time-intervals';

export class ServerCache {
    static cacheStore: CacheStore<CacheEntry>;
    @Inject private logger: Logger;
    @Inject private database: Database;

    constructor() {
        if (!ServerCache.cacheStore) {
            this.initializeCacheStore();
        }
    }

    private initializeCacheStore() {
        if (this.logger.isDebugEnabled()) {
            this.logger.debug('Initializing Redis cache store.');
        }
        ServerCache.cacheStore = new RedisStore({
            client: this.database.redisClient
        });
    }

    buildCacheMiddleware(serverCache: ServerCacheConfig, path: string, req: string, res: string,
        next: string, stats?: string) {
        if (this.logger.isDebugEnabled()) {
            this.logger.debug('Configuring Server Cache for path [%s].', path);
        }
        const result = new Array<string>();
        result.push(`ServerCache.cacheStore.get(${req}.originalUrl, function(err, entry){`);
        result.push(`if (err) {`);
        if (stats) {
            result.push(`${stats}.cacheError.registerOccurrence(${req}.path, 1);`);
        }
        result.push(`return ${next}();`);
        result.push('}');
        result.push('if (entry) {');
        // cache hit
        if (stats) {
            result.push(`${stats}.cacheHit.registerOccurrence(${req}.path, 1);`);
        }
        result.push(`${res}.contentType(entry.mimeType || "text/html");`);
        if (serverCache.preserveHeaders) {
            serverCache.preserveHeaders.forEach((header) => {
                result.push(`${res}.set('${header}', entry.header['${header}']);`);
            });
        }
        result.push(`${res}.send(new Buffer(entry.content, "base64"));`);
        result.push(`}`);
        result.push(`else {`);
        // cache miss
        if (stats) {
            result.push(`${stats}.cacheMiss.registerOccurrence(${req}.path, 1);`);
        }
        result.push(`${req}.parseRespBody = true;`);
        result.push(`var send = ${res}.send.bind(${res});`);
        result.push(`${res}.send = function (body) {`);
        result.push(`var ret = send(body);`);
        result.push(`if ( !body ) {`);
        result.push(`body = '';`);
        result.push(`}`);
        result.push(`body = new Buffer(body).toString("base64");`);
        result.push(`if ( typeof body !== "string" ) {`);
        result.push(`return ret;`);
        result.push(`}`);

        result.push(`if ((${res}.statusCode >= 200 && ${res}.statusCode < 300) || (${res}.statusCode === 304)){`);
        const cacheTime = getMilisecondsInterval(serverCache.cacheTime);
        result.push(`ServerCache.cacheStore.set(${req}.originalUrl, {`);
        result.push(`content: body,`);
        result.push(`mimeType: this._headers["content-type"]`);
        if (serverCache.preserveHeaders) {
            result.push(',header: {');
            serverCache.preserveHeaders.forEach((header, index) => {
                if (index > 0) {
                    result.push(`,`);
                }
                result.push(`'${header}': this._headers['${header}']`);
            });
            result.push(`}`);
        }
        result.push(`}, ${cacheTime});`);
        result.push(`}`);

        result.push(`return ret;`);
        result.push(`};`);
        result.push(`return ${next}();`);
        // end cache miss

        result.push(`}`);
        result.push(`});`);
        result.push(`return;`);
        return result.join('');
    }
}
