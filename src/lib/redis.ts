"use strict";

import * as redis from "ioredis";
import {RedisConfig} from "./config/gateway"
let defaults = require('defaults');

export function initializeRedis(config: RedisConfig) {
    config = defaults(config, {
        host: "localhost", 
        port: 6379
    });    
    return new redis(config.port, config.host);
}