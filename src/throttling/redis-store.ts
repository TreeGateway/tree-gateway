'use strict';
import * as redis from 'ioredis';
import * as _ from 'lodash';

export interface Options {
    path: string;
    client: redis.Redis;
    id?: string;
    expire?: number;
    prefix?: string;
}

export class RedisStore {
    options: Options;

    constructor(options: Options) {
        this.options = _.defaults(options, {
            expire: 60, // default expire is one minute
            prefix: 'rl'
        });
    }

    incr(key: string, cb: any) {
        const rdskey = this.getRedisKey(key);
        const opt: Options = this.options;
        opt.client.multi()
            .incr(rdskey)
            .ttl(rdskey)
            .exec(function(err, replies) {
                if (err) {
                    return cb(err);
                }

                // if this is new or has no expire
                if (replies[0][1] === 1 || replies[1][1] === -1) {
                    // then expire it after the timeout
                    opt.client.expire(rdskey, opt.expire);
                }

                cb(null, replies[0][1]);
            });
    }

    resetKey(key: string) {
        const rdskey = this.getRedisKey(key);
        this.options.client.del(rdskey);
    }

    private getRedisKey(key: string) {
        const result: Array<string> = [];
        result.push(this.options.prefix);
        result.push(this.options.path);
        if (this.options.id) {
            result.push(this.options.id);
        }
        result.push(key);
        return result.join(':');
    }
}
