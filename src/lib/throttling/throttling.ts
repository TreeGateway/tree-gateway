"use strict";

import * as express from "express";
import {ThrottlingConfig} from "../config/throttling";
import * as Utils from "underscore";
import * as pathUtil from "path"; 
import {Gateway} from "../gateway";

export class ApiRateLimit {
    private gateway: Gateway;

    constructor(gateway: Gateway) {
        this.gateway = gateway;
    }

    throttling(path: string, throttling: ThrottlingConfig) {
        let RateLimit = require('express-rate-limit');
        let rateConfig = Utils.omit(throttling, "store", "keyGenerator", "handler");

        if (this.gateway.redisClient) {
            let store = require('./store');
            if (this.gateway.logger.isDebugEnabled()) {
                this.gateway.logger.debug("Using Redis as throttling store.");
            }
            rateConfig.store = new store.RedisStore({
                expiry: (throttling.windowMs / 1000) +1,
                client: this.gateway.redisClient
            });
        }
        

        if (throttling.keyGenerator) {
            let p = pathUtil.join(this.gateway.middlewarePath, 'throttling', 'keyGenerator' , throttling.keyGenerator);                
            rateConfig.keyGenerator = require(p);
        }
        if (throttling.handler) {
            let p = pathUtil.join(this.gateway.middlewarePath, 'throttling', 'handler' , throttling.handler);                
            rateConfig.handler = require(p);
        }

        let limiter = new RateLimit(rateConfig);        
        this.gateway.server.use(path, limiter);
    }
}
