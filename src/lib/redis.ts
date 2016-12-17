"use strict";

import * as redis from "ioredis";
import {RedisConfig} from "./config/gateway"
import * as _ from "lodash";

export function initializeRedis(config: RedisConfig) {
    config = _.defaults(config, {
        host: "localhost", 
        port: 6379
    });    
    return new redis(config.port, config.host);
}