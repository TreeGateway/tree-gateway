"use strict";

import * as express from "express";
import {ApiConfig} from "../config/api";
import {ThrottlingConfig} from "../config/throttling";
import * as _ from "lodash";
import * as pathUtil from "path"; 
import {Gateway} from "../gateway";
import * as Groups from "../group";
import {RedisStore} from "./redis-store";
import {Stats} from "../stats/stats";
import {Logger} from "../logger";
import {AutoWired, Inject} from "typescript-ioc";
import {Configuration} from "../configuration";
import {Database} from "../database";
import {StatsRecorder} from "../stats/stats-recorder";

interface ThrottlingInfo{
    limiter?: express.RequestHandler;
    groupValidator?: (req:express.Request, res:express.Response)=>boolean;
}

@AutoWired
export class ApiRateLimit {
    @Inject private config: Configuration;
    @Inject private logger: Logger;
    @Inject private database: Database;
    @Inject private statsRecorder: StatsRecorder;

    throttling(apiRouter: express.Router, api: ApiConfig) {
        let path: string = api.path;
        let throttlings: Array<ThrottlingConfig> = this.sortLimiters(api.throttling, path);
        let RateLimit = require('express-rate-limit');
        let throttlingInfos: Array<ThrottlingInfo> = new Array<ThrottlingInfo>();

        throttlings.forEach((throttling: ThrottlingConfig) => {
            let throttlingInfo: ThrottlingInfo = {}; 
            let rateConfig: any = _.defaults(_.omit(throttling, "store", "keyGenerator", "handler", "group"), {
                statusCode: 429,
                message: 'Too many requests, please try again later.'
            }
            );
            rateConfig.store = new RedisStore({
                path: path,
                expire: (throttling.windowMs / 1000) +1,
                client: this.database.redisClient
            });
            
            if (throttling.keyGenerator) {
                let p = pathUtil.join(this.config.middlewarePath, 'throttling', 'keyGenerator' , throttling.keyGenerator);                
                rateConfig.keyGenerator = require(p);
            }
            if (throttling.skip) {
                let p = pathUtil.join(this.config.middlewarePath, 'throttling', 'skip' , throttling.skip);                
                rateConfig.skip = require(p);
            }
            this.configureThrottlingHandlerFunction(path, throttling, rateConfig);
            throttlingInfo.limiter = new RateLimit(rateConfig);

            if (this.logger.isDebugEnabled()) {
                this.logger.debug(`Configuring Throtlling controller for path [${api.path}].`);
            }
            if (throttling.group){
                if (this.logger.isDebugEnabled()) {
                    let groups = Groups.filter(api.group, throttling.group);
                    this.logger.debug(`Configuring Group filters for Throtlling on path [${api.path}]. Groups [${JSON.stringify(groups)}]`);
                }
                throttlingInfo.groupValidator = Groups.buildGroupAllowFilter(api.group, throttling.group);
            }
            throttlingInfos.push(throttlingInfo);
        });
        
        this.setupMiddlewares(apiRouter, throttlingInfos);
    }

    private configureThrottlingHandlerFunction(path: string, throttling: ThrottlingConfig, rateConfig: any) {
        let stats = this.createStats(path, throttling);
        if (stats) {
            if (throttling.handler) {
                let p = pathUtil.join(this.config.middlewarePath, 'throttling', 'handler' , throttling.handler);                
                let customHandler = require(p);
                rateConfig.handler = function (req, res, next) {
                    stats.registerOccurrence(req.path, 1);
                    customHandler(req, res, next);
                };
            } 
            else {
                rateConfig.handler = function (req, res) {
                    stats.registerOccurrence(req.path, 1);
                    res.format({
                        html: function(){
                            res.status(rateConfig.statusCode).end(rateConfig.message);
                        },
                        json: function(){
                            res.status(rateConfig.statusCode).json({ message: rateConfig.message });
                        }
                    });                        
                };
            }
        }
        else if (throttling.handler) {
            let p = pathUtil.join(this.config.middlewarePath, 'throttling', 'handler' , throttling.handler);                
            rateConfig.handler = require(p);
        }
    }

    private setupMiddlewares(apiRouter: express.Router, throttlingInfos: Array<ThrottlingInfo>) {
        throttlingInfos.forEach((throttlingInfo: ThrottlingInfo) =>{
            apiRouter.use(this.buildMiddleware(throttlingInfo));
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
        let generalThrottlings = _.filter(throttlings, (value)=>{
            if (value.group) {
                return true;
            }
            return false;
        });
        
        if (generalThrottlings.length > 1) {
            this.logger.error(`Invalid throttling configuration for api [${path}]. Conflicting configurations for default group`);
                return [];
        }

        if (generalThrottlings.length > 0) {
            let index = throttlings.indexOf(generalThrottlings[0]);
            if (index < throttlings.length -1) {
                let gen = throttlings.splice(index, 1);
                throttlings.push(gen[0])   
            }
        }
        return throttlings;
    }

    private createStats(path: string, throttling: ThrottlingConfig) : Stats {
        if (!throttling.disableStats) {
            return this.statsRecorder.createStats(Stats.getStatsKey('throt', path, 'exceeded'), throttling.statsConfig);
        }

        return null;
    }
    
}
