"use strict";

import * as express from "express";
import {ApiConfig} from "../config/api";
import {ThrottlingConfig} from "../config/throttling";
import * as Utils from "underscore";
import * as pathUtil from "path"; 
import {Gateway} from "../gateway";
import * as Groups from "../group";
import {RedisStore} from "./redis-store";

interface ThrottlingInfo{
    limiter?: express.RequestHandler;
    groupValidator?: (req:express.Request, res:express.Response)=>boolean;
}

export class ApiRateLimit {
    private gateway: Gateway;

    constructor(gateway: Gateway) {
        this.gateway = gateway;
    }

    throttling(api: ApiConfig) {
        let path: string = api.proxy.path;
        let throttlings: Array<ThrottlingConfig> = this.sortLimiters(api.throttling, path);
        let RateLimit = require('express-rate-limit');
        let throttlingInfos: Array<ThrottlingInfo> = new Array<ThrottlingInfo>();

        throttlings.forEach((throttling: ThrottlingConfig) => {
            let throttlingInfo: ThrottlingInfo = {}; 
            let rateConfig = Utils.omit(throttling, "store", "keyGenerator", "handler", "group");
            rateConfig.store = new RedisStore({
                path: path,
                expiry: (throttling.windowMs / 1000) +1,
                client: this.gateway.redisClient
            });
            
            if (throttling.keyGenerator) {
                let p = pathUtil.join(this.gateway.middlewarePath, 'throttling', 'keyGenerator' , throttling.keyGenerator);                
                rateConfig.keyGenerator = require(p);
            }
            if (throttling.handler) {
                let p = pathUtil.join(this.gateway.middlewarePath, 'throttling', 'handler' , throttling.handler);                
                rateConfig.handler = require(p);
            }

            throttlingInfo.limiter = new RateLimit(rateConfig);

            if (this.gateway.logger.isDebugEnabled()) {
                this.gateway.logger.debug(`Configuring Throtlling controller for path [${api.proxy.target.path}].`);
            }
            if (throttling.group){
                if (this.gateway.logger.isDebugEnabled()) {
                    let groups = Groups.filter(api.group, throttling.group);
                    this.gateway.logger.debug(`Configuring Group filters for Throtlling on path [${api.proxy.target.path}]. Groups [${JSON.stringify(groups)}]`);
                }
                throttlingInfo.groupValidator = Groups.buildGroupAllowFilter(api.group, throttling.group);
            }
            throttlingInfos.push(throttlingInfo);
        });
        
        this.setupMiddlewares(throttlingInfos, path);
    }

    private setupMiddlewares(throttlingInfos: Array<ThrottlingInfo>, path: string) {
        throttlingInfos.forEach((throttlingInfo: ThrottlingInfo) =>{
            this.gateway.server.use(path, this.buildMiddleware(throttlingInfo));
        });
    }

    private buildMiddleware(throttlingInfo: ThrottlingInfo) {
        return (req: express.Request, res: express.Response, next: express.NextFunction)=>{
            if (throttlingInfo.groupValidator) {
                if (throttlingInfo.groupValidator(req, res)) {
                    throttlingInfo.limiter(req, res, next);
                }
                else {
                    next();
                }
            }
            else {
                throttlingInfo.limiter(req, res, next);
            }
        };
    }

    private sortLimiters(throttlings: Array<ThrottlingConfig>, path: string): Array<ThrottlingConfig> {
        let generalThrottlings = Utils.filter(throttlings, (value)=>{
            if (value.group) {
                return true;
            }
            return false;
        });
        
        if (generalThrottlings.length > 1) {
            this.gateway.logger.error(`Invalid throttling configuration for api [${path}]. Conflicting configurations for default group`);
                return [];
        }

        if (generalThrottlings.length > 0) {
            let index = throttlings.indexOf(generalThrottlings[0]);
            if (index < throttlings.length -1) {
                let gen = throttlings.splice(index, 1);
                throttlings.push(gen)   
            }
        }
        return throttlings;
    }
}
