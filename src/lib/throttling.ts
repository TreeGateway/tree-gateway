"use strict";

import * as express from "express";
import * as config from "./config";
import * as Utils from "underscore";
import {AutoWired, Inject} from "typescript-ioc";
import {Settings} from "./settings";

@AutoWired
export class ApiRateLimit {
    @Inject
    private settings: Settings;

    throttling(path: string, throttling: config.Throttling) {
        let RateLimit = require('express-rate-limit');
        let rateConfig = Utils.omit(throttling, "store");
        if (throttling.store === 'redis') {
            let RedisStore = require('rate-limit-redis');

            rateConfig.store = new RedisStore({
// expiry: seconds - how long each rate limiting window exists for. Defaults to 60.
// prefix: string - prefix to add to entries in Redis. Defaults to rl:.
// client: Redis Client - A node_redis Redis Client to use. Defaults to require('redis').createClient();.
                expiry: (throttling.windowMs / 1000) +1
            });
        }
        
        let limiter = new RateLimit(rateConfig);        

        this.settings.app.use(path, limiter);
    }
}
