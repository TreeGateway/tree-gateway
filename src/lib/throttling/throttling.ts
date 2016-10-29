"use strict";

import * as express from "express";
import * as config from "../config";
import * as Utils from "underscore";
import {AutoWired, Inject} from "typescript-ioc";
import {Settings} from "../settings";
import * as pathUtil from "path"; 

@AutoWired
export class ApiRateLimit {
    @Inject
    private settings: Settings;

    throttling(path: string, throttling: config.Throttling) {
        let RateLimit = require('express-rate-limit');
        let rateConfig = Utils.omit(throttling, "store", "keyGenerator", "handler");
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

        if (throttling.keyGenerator) {
            let p = pathUtil.join(this.settings.middlewarePath, 'throttling', 'keyGenerator' , throttling.keyGenerator);                
            rateConfig.keyGenerator = require(p);
        }
        if (throttling.handler) {
            let p = pathUtil.join(this.settings.middlewarePath, 'throttling', 'handler' , throttling.handler);                
            rateConfig.handler = require(p);
        }

        this.settings.app.use(path, limiter);
    }
}
