'use strict';

import { CacheEntry, CacheStore, StoreCallback } from "./cache-store";
import * as redis from "ioredis";
let defaults = require('defaults');

interface Options {
    maxAge?: number;
    prefix?: string;
    client: redis.Redis;
}

export class RedisStore implements CacheStore<CacheEntry>{
    options: Options;

    constructor(options: Options) {
        this.options = defaults(options, {
            maxAge: 60, // default expiry is one minute
            prefix: "ca:"
        });
    }

    set(key: string, value: CacheEntry, maxAge?: number): void {
        let rdskey = this.options.prefix + key;
        let opt: Options = this.options;
        if (maxAge) {
            opt.maxAge = maxAge / 1000;
        }
        opt.client.set(rdskey, JSON.stringify(value), 'EX', opt.maxAge);
    }

    get(key: string, callback: StoreCallback<CacheEntry>): void {
        let rdskey = this.options.prefix + key;
        this.options.client.get(rdskey).then((cachedValue: string) => {
            if (cachedValue) {
                callback(null, JSON.parse(cachedValue));
            }
            else {
                callback(null, null);
            }
        }).catch((err: any)=>{
            callback(err, null);
        });
    }

    del(key: string): void {
        let rdskey = this.options.prefix + key;
        this.options.client.del(rdskey);
    }
}