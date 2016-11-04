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

        if (this.settings.redisClient) {
            let store = require('./store');
            this.settings.logger.debug("Using Redis as throttling store.");
            rateConfig.store = new store.RedisStore({
                expiry: (throttling.windowMs / 1000) +1,
                client: this.settings.redisClient
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
