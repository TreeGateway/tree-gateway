"use strict";

import * as express from "express";
import {ApiConfig} from "../config/api";
import {CorsConfig} from "../config/cors";
import * as _ from "lodash";
import * as pathUtil from "path"; 
import {Gateway} from "../gateway";
import * as Groups from "../group";
import {Stats} from "../stats/stats";
import * as corsMiddleware from "cors";
import * as humanInterval from "human-interval";

interface CorsInfo{
    corsMiddleware?: express.RequestHandler;
    corsPreFlightPath?: Array<string>;
    groupValidator?: (req:express.Request, res:express.Response)=>boolean;
}

export class ApiCors {
    private gateway: Gateway;

    constructor(gateway: Gateway) {
        this.gateway = gateway;
    }

    cors(apiRouter: express.Router, api: ApiConfig) {
        let path: string = api.proxy.path;
        let configusrations: Array<CorsConfig> = this.sortMiddlewares(api.cors, path);
        let corsInfos: Array<CorsInfo> = new Array<CorsInfo>();

        configusrations.forEach((cors: CorsConfig) => {
            let corsInfo: CorsInfo = {}; 
            let corsOptions: corsMiddleware.CorsOptions = _.omit(cors, "id", "origin", "maxAge", "group")
            
            this.configureCorsOrigin(path, cors, corsOptions);
            if (cors.maxAge) {
                corsOptions.maxAge = humanInterval(cors.maxAge);
            }
            corsInfo.corsMiddleware = corsMiddleware(corsOptions);

            if (this.gateway.logger.isDebugEnabled()) {
                this.gateway.logger.debug(`Configuring Cors for path [${api.proxy.path}].`);
            }
            if (cors.group){
                if (this.gateway.logger.isDebugEnabled()) {
                    let groups = Groups.filter(api.group, cors.group);
                    this.gateway.logger.debug(`Configuring Group filters for Cors on path [${api.proxy.path}]. Groups [${JSON.stringify(groups)}]`);
                }
                corsInfo.groupValidator = Groups.buildGroupAllowFilter(api.group, cors.group);
            }
            corsInfos.push(corsInfo);
        });
        
        this.setupMiddlewares(apiRouter, corsInfos);
    }

    private configureCorsOrigin(path: string, cors: CorsConfig, corsOptions: corsMiddleware.CorsOptions) {
        if (cors.origin.enableAll) {
            corsOptions.origin = true;
        }
        else if (cors.origin.disableAll) {
            corsOptions.origin = false;
        }
        else if (cors.origin.allow) {
            corsOptions.origin = <string[]>cors.origin.allow.map(originConfig=>{
                if (originConfig.value) {
                    return originConfig.value;
                }
                else 
                    return new RegExp(originConfig.regexp);
            });
        }
        else if (cors.origin.dynamic) {
            let p = pathUtil.join(this.gateway.middlewarePath, 'cors', 'origin' , cors.origin.dynamic);                
            corsOptions.origin = require(p);
        }
    }

    private setupMiddlewares(apiRouter: express.Router, throttlingInfos: Array<CorsInfo>) {
        throttlingInfos.forEach((corsInfo: CorsInfo) =>{
            let middleware = this.buildMiddleware(corsInfo);
            apiRouter.use(middleware);
        });
    }

    private buildMiddleware(corsInfo: CorsInfo) {
        return (req: express.Request, res: express.Response, next: express.NextFunction)=>{
            if (corsInfo.groupValidator) {
                if (corsInfo.groupValidator(req, res)) {
                    corsInfo.corsMiddleware(req, res, next);
                }
                else {
                    next();
                }
            }
            else {
                corsInfo.corsMiddleware(req, res, next);
            }
        };
    }

    private sortMiddlewares(corsConfigs: Array<CorsConfig>, path: string): Array<CorsConfig> {
        let generalThrottlings = _.filter(corsConfigs, (value)=>{
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
            let index = corsConfigs.indexOf(generalThrottlings[0]);
            if (index < corsConfigs.length -1) {
                let gen = corsConfigs.splice(index, 1);
                corsConfigs.push(gen[0])   
            }
        }
        return corsConfigs;
    }
}
