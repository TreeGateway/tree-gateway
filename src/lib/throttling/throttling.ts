"use strict";

import * as express from "express";
import {ApiConfig} from "../config/api";
import {ThrottlingConfig} from "../config/throttling";
import * as Utils from "underscore";
import * as pathUtil from "path"; 
import {Gateway} from "../gateway";
import * as Groups from "../group";

export class ApiRateLimit {
    private gateway: Gateway;

    constructor(gateway: Gateway) {
        this.gateway = gateway;
    }

    throttling(api: ApiConfig) {
        let path: string = api.proxy.path;
        let throttling: ThrottlingConfig = api.throttling;

        let RateLimit = require('express-rate-limit');
        let rateConfig = Utils.omit(throttling, "store", "keyGenerator", "handler", "group");

        if (this.gateway.redisClient) {
            let store = require('./redis-store');
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

        if (this.gateway.logger.isDebugEnabled()) {
            this.gateway.logger.debug('Configuring Throtlling controller for path [%s].', api.proxy.target.path);
        }
        if (throttling.group){
            if (this.gateway.logger.isDebugEnabled()) {
                let groups = Groups.filter(api.group, throttling.group);
                this.gateway.logger.debug('Configuring Group filters for Throtlling on path [%s]. Groups [%s]', 
                    api.proxy.target.path, JSON.stringify(groups));
            }
            let f = Groups.buildGroupAllowFilter(api.group, throttling.group);
            this.gateway.server.use(path, (req, res, next)=>{
                if (f(req, res)){
                    limiter(req, res, next);
                }
                else {
                    next(); 
                }
            });
        }        
        else {
            this.gateway.server.use(path, limiter);
        }
    }
}
