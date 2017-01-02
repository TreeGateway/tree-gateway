"use strict";

import * as Redis from "ioredis";
import {RedisConfig} from "./config/gateway"
import * as _ from "lodash";

export function initializeRedis(config: RedisConfig) {
    let client;

    config = _.defaults(config, {
        options: {}
    });

    if (config.cluster) {
        client = new Redis.Cluster(<any> config.cluster, {
            scaleReads: "all",
            redisOptions: config.options
        });
    }
    else if (config.sentinel) {
        const params = _.defaults(config.options, {
            sentinels: config.sentinel.nodes,
            name: config.sentinel.name
        });

        client = new Redis(params);
    }
    else {
        config.standalone = _.defaults(config.standalone, {
            host: "localhost",
            port: 6379
        });

        if (config.standalone.password) {
            config.options.password = config.standalone.password;
        }

        client = new Redis(config.standalone.port, config.standalone.host, config.options);
    }
    
    return client;
}