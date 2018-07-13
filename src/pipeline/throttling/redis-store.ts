'use strict';
import * as _ from 'lodash';
import { Inject } from 'typescript-ioc';
import { Database } from '../../database';

export interface Options {
    path: string;
    id?: string;
    expire?: number;
    prefix?: string;
}

export class RedisStore {
    public options: Options;
    @Inject private database: Database;

    constructor(options: Options) {
        this.options = _.defaults(options, {
            expire: 60, // default expire is one minute
            prefix: 'rl'
        });
    }

    public incr(key: string, cb: any) {
        const rdskey = this.getRedisKey(key);
        const opt: Options = this.options;
        this.database.redisClient.multi()
            .incr(rdskey)
            .ttl(rdskey)
            .exec((err, replies) => {
                if (err) {
                    return cb(err);
                }

                // if this is new or has no expire
                if (replies[0][1] === 1 || replies[1][1] === -1) {
                    // then expire it after the timeout
                    this.database.redisClient.expire(rdskey, opt.expire);
                }

                cb(null, replies[0][1]);
            });
    }

    public resetKey(key: string) {
        const rdskey = this.getRedisKey(key);
        this.database.redisClient.del(rdskey);
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
