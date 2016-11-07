"use strict";

import * as express from "express";
import * as fs from "fs-extra";
import * as StringUtils from "underscore.string";
import {ApiConfig} from "./config/api";
import {GatewayConfig} from "./config/gateway";
import {ApiProxy} from "./proxy/proxy";
import * as Utils from "./proxy/utils";
import {ApiRateLimit} from "./throttling/throttling";
import {ApiAuth} from "./authentication/auth";
import {Set, StringMap} from "./es5-compat";
import {Logger} from "./logger";
import * as redis from "ioredis";
import * as dbConfig from "./redis";
import * as path from "path";

let defaults = require('defaults');

export class Gateway {
    private app: express.Application;
    private apiProxy: ApiProxy;
    private apiRateLimit: ApiRateLimit;
    private apiAuth: ApiAuth;
    private apis: StringMap<ApiConfig>;
    private _config: GatewayConfig;
    private _logger: Logger;
    private _redisClient: redis.Redis;

    constructor(app: express.Application, gatewayConfig?: GatewayConfig) {
        this._config = defaults(gatewayConfig, {
            rootPath : __dirname,
            apiPath : path.join(__dirname +'/apis'),
            middlewarePath : path.join(__dirname +'/middleware')
        });
        
        this.app = app;
        this._logger = new Logger(this.config.logger, this);
        if (this.config.database) {
            this._redisClient = dbConfig.initializeRedis(this.config.database);
        }
        this.apiProxy = new ApiProxy(this);
        this.apiRateLimit = new ApiRateLimit(this);
        this.apiAuth = new ApiAuth(this);
    }    
    
    get server(): express.Application {
        return this.app;
    }

    get logger(): Logger {
        return this._logger;
    }

    get config(): GatewayConfig {
        return this._config;
    }

    get redisClient(): redis.Redis {
        return this._redisClient;
    }

    get apiPath(): string {
        return this.config.apiPath;
    }

    get middlewarePath(): string {
        return this.config.middlewarePath;
    }

    initialize(ready?: () => void) {
        this.apis = new StringMap<ApiConfig>();
        let path = this.apiPath;
        fs.readdir(path, (err, files) => {
            if (err) {
                this._logger.error("Error reading directory: "+err);
            }
            else {
                path = ((StringUtils.endsWith(path, '/'))?path:path+'/');
                const length = files.length;
                files.forEach((fileName, index) =>{
                    if (StringUtils.endsWith(fileName, '.json')) {
                        fs.readJson(path+fileName, (error, apiConfig: ApiConfig)=>{
                            if (error) {
                                this._logger.error("Error reading directory: "+error);
                            }
                            else {
                                this.loadApi(apiConfig, (length -1 === index)?ready: null);
                            }
                        });
                    }
                });
            }
        });
    }

    loadApi(api: ApiConfig, ready?: () => void) {
        if (this._logger.isInfoEnabled()) {
            this._logger.info("Configuring API [%s] on path: %s", api.name, api.proxy.path);
        }
        let apiKey: string = this.getApiKey(api);
        this.apis.set(apiKey, api);
        api.proxy.path = Utils.normalizePath(api.proxy.path);
        
        if (api.throttling) {
            if (this._logger.isDebugEnabled()) {
                this._logger.debug("Configuring API Rate Limits");
            }
            this.apiRateLimit.throttling(api.proxy.path, api.throttling);
        }
        if (api.authentication) {
            if (this._logger.isDebugEnabled()) {
                this._logger.debug("Configuring API Authentication");
            }
            this.apiAuth.authentication(apiKey, api.proxy.path, api.authentication);
        }
        if (this._logger.isDebugEnabled()) {
            this._logger.debug("Configuring API Proxy");
        }
        this.apiProxy.proxy(api);
        
        if (ready) {
            ready();
        }
    }

    private getApiKey(api: ApiConfig) {
        return api.name + (api.version? '_'+api.version: '_default');
    }
}
/*TODO: 
- Create a file for Gateway configurations:
  - Global interceptors / Filters / Throttling
- Create a global interceptor to add a 'Via' header pointing to Tree-Gateway
- Expose an Admin port
- Manage API versions
- Fix the log (winston is not logging on log file, but just on consoles)
- Create a clsuter program, to initialize the app in cluster
*/