'use strict';

import * as cache from "lru-cache";
import {CacheEntry, CacheStore, StoreCallback} from "./cache-store";
let defaults = require('defaults');

export class MemoryStore implements CacheStore<CacheEntry>{
    cache: cache.Cache<CacheEntry>;

    constructor(options: cache.Options<CacheEntry>) {
        this.cache = cache<CacheEntry>(defaults(options, {
            length: (value: CacheEntry)=>{
                return value.content.length;
            }
        }));
    }

    get(key, callback: StoreCallback<CacheEntry>): void {
        let value = this.cache.get(key);
        callback(null, value);
    }

    set(key: any, value: CacheEntry, maxAge?: number): void {
        this.cache.set(key, value, maxAge);
    }

    del(key: any): void {
        this.cache.del(key);
    }
}