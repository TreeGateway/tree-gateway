"use strict";

import {CircuitBreakerConfig} from "../config/circuit-breaker";
import {ApiConfig} from "../config/api";
import {Stats} from "../stats/stats";
import * as express from "express";
import * as _ from "lodash";
import {CircuitBreaker} from "./express-circuit-breaker"
import * as Groups from "../group";
import * as pathUtil from "path";
import {RedisStateHandler} from "./redis-state-handler";
import {Logger} from "../logger";
import {AutoWired, Inject} from "typescript-ioc";
import {Configuration} from "../configuration";
import {StatsRecorder} from "../stats/stats-recorder";

class StatsController {
    open: Stats;
    close: Stats;
    rejected: Stats;
}

interface BreakerInfo{
    circuitBreaker?: CircuitBreaker;
    groupValidator?: (req:express.Request, res:express.Response)=>boolean;
}

@AutoWired
export class ApiCircuitBreaker {
    @Inject private config: Configuration;
    @Inject private logger: Logger;
    @Inject private statsRecorder: StatsRecorder;

    private activeBreakers: Map<string, CircuitBreaker> = new Map<string, CircuitBreaker>();

    circuitBreaker(apiRouter: express.Router, api: ApiConfig) {
        let path: string = api.proxy.path;
        let breakerInfos: Array<BreakerInfo> = new Array<BreakerInfo>();
        let sortedBreakers = this.sortBreakers(api.circuitBreaker, api.proxy.path);
        let breakersSize = sortedBreakers.length;
        sortedBreakers.forEach((cbConfig: CircuitBreakerConfig, index: number) => {
            let breakerInfo: BreakerInfo = {}; 
            let cbStateID = (breakersSize > 1?`${api.proxy.path}:${index}`:api.proxy.path);
            let cbOptions: any = {
                timeout: cbConfig.timeout || 30000,
                maxFailures: (cbConfig.maxFailures || 10),
                stateHandler: new RedisStateHandler(cbStateID, cbConfig.resetTimeout || 120000),
                timeoutStatusCode: (cbConfig.timeoutStatusCode || 504),
                timeoutMessage: (cbConfig.timeoutMessage || "Operation timeout"),
                rejectStatusCode: (cbConfig.rejectStatusCode || 503),
                rejectMessage: (cbConfig.rejectMessage || "Service unavailable"),
                id: cbStateID
            };
            if (this.logger.isDebugEnabled()) {
                this.logger.debug(`Configuring Circuit Breaker for path [${api.proxy.path}].`);
            }
            breakerInfo.circuitBreaker = new CircuitBreaker(cbOptions);
            this.configureCircuitBreakerEventListeners(breakerInfo, api.proxy.path, cbConfig);
            if (cbConfig.group){
                if (this.logger.isDebugEnabled()) {
                    let groups = Groups.filter(api.group, cbConfig.group);
                    this.logger.debug(`Configuring Group filters for Circuit Breaker on path [${api.proxy.path}]. Groups [${JSON.stringify(groups)}]`);
                }
                breakerInfo.groupValidator = Groups.buildGroupAllowFilter(api.group, cbConfig.group);
            }
            breakerInfos.push(breakerInfo);        
        });

        this.setupMiddlewares(apiRouter, breakerInfos);
    }
    
    onStateChanged(id: string, state: string) {
        let breaker: CircuitBreaker = this.activeBreakers.get(id);
        if (breaker) {
            breaker.onStateChanged(state);
        }
    }

    removeBreaker(id: string) {
        this.activeBreakers.delete(id);
    }

    removeAllBreakers() {
        this.activeBreakers.clear();
    }

    private configureCircuitBreakerEventListeners(breakerInfo: BreakerInfo, path: string, config: CircuitBreakerConfig) {
        let stats  = this.createCircuitBreakerStats(path, config);
        if (stats) {
            breakerInfo.circuitBreaker.on('open', ()=>{
                stats.open.registerOccurrence('total', 1);
            });
            breakerInfo.circuitBreaker.on('close', ()=>{
                stats.close.registerOccurrence('total', 1);
            });
            breakerInfo.circuitBreaker.on('rejected', ()=>{
                stats.rejected.registerOccurrence('total', 1);
            });
        }
        if (config.onOpen) {
            let p = pathUtil.join(this.config.gateway.middlewarePath, 'circuitbreaker', 'handler' , config.onOpen);                
            let openHandler = require(p);
            breakerInfo.circuitBreaker.on('open', ()=>{
                openHandler(path);
            });
        }
        if (config.onClose) {
            let p = pathUtil.join(this.config.gateway.middlewarePath, 'circuitbreaker', 'handler' , config.onClose);                
            let closeHandler = require(p);
            breakerInfo.circuitBreaker.on('close', ()=>{
                closeHandler(path);
            });
        }
        if (config.onRejected) {
            let p = pathUtil.join(this.config.gateway.middlewarePath, 'circuitbreaker', 'handler' , config.onRejected);                
            let rejectedHandler = require(p);
            breakerInfo.circuitBreaker.on('rejected', ()=>{
                rejectedHandler(path);
            });
        }        
    }

    private setupMiddlewares(apiRouter: express.Router, breakerInfos: Array<BreakerInfo>) {
        breakerInfos.forEach((breakerInfo: BreakerInfo) => {
            this.activeBreakers.set(breakerInfo.circuitBreaker.id, breakerInfo.circuitBreaker);
            apiRouter.use(this.buildMiddleware(breakerInfo));
        });
    }
    
    private buildMiddleware(breakerInfo: BreakerInfo) {
        let circuitBreakerMiddleware = breakerInfo.circuitBreaker.middleware();
        
        return (req: express.Request, res: express.Response, next: express.NextFunction)=>{
            if (breakerInfo.groupValidator) {
                if (breakerInfo.groupValidator(req, res)) {
                    circuitBreakerMiddleware(req, res, next);
                }
                else {
                    next();
                }
            }
            else {
                circuitBreakerMiddleware(req, res, next);
            }
        };
    }    

    private sortBreakers(breakers: Array<CircuitBreakerConfig>, path: string): Array<CircuitBreakerConfig> {
        let generalBreakers = _.filter(breakers, (value)=>{
            if (value.group) {
                return true;
            }
            return false;
        });
        
        if (generalBreakers.length > 1) {
            this.logger.error(`Invalid circuit breaker configuration for api [${path}]. Conflicting configurations for default group`);
                return [];
        }

        if (generalBreakers.length > 0) {
            let index = breakers.indexOf(generalBreakers[0]);
            if (index < breakers.length -1) {
                let gen = breakers.splice(index, 1);
                breakers.push(gen[0])   
            }
        }
        return breakers;
    }

    private createCircuitBreakerStats(path: string, config: CircuitBreakerConfig) : StatsController {
        if (!config.disableStats) {
            let stats: StatsController = new StatsController();
            stats.close = this.statsRecorder.createStats(Stats.getStatsKey('circuitbreaker', path, 'close'), config.statsConfig);
            stats.open = this.statsRecorder.createStats(Stats.getStatsKey('circuitbreaker', path, 'open'), config.statsConfig);
            stats.rejected = this.statsRecorder.createStats(Stats.getStatsKey('circuitbreaker', path, 'rejected'), config.statsConfig);
            
            if (stats.open) {
                return stats;
            }
        }

        return null;
    }
}

