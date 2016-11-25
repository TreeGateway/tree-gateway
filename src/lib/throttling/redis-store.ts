'use strict';
import * as redis from "ioredis";
let defaults = require('defaults');

interface Options {
    expiry?: number;
    prefix?: string;
    client: redis.Redis;
}

export class RedisStore {
  options: Options;
  
  constructor(options: Options) {
    this.options = defaults(options, {
        expiry: 60, // default expiry is one minute
        prefix: "rl:"
    });
  }


  incr (key: string, cb) {
    let rdskey = this.options.prefix + key;
    let opt: Options = this.options;
    opt.client.multi()
      .incr(rdskey)
      .ttl(rdskey)
      .exec(function(err, replies) {
        if (err) {
          return cb(err);
        }

        // if this is new or has no expiry
        if (replies[0][1] === 1 || replies[1][1] === -1) {
          // then expire it after the timeout
          opt.client.expire(rdskey, opt.expiry);
        }

        cb(null, replies[0][1]);
      });
  }

  resetKey(key: string) {
    let rdskey = this.options.prefix + key;

    this.options.client.del(rdskey);
  }
}