/// <reference path="./utils/collections.d.ts" />
"use strict";

import * as http from "http";
import * as compression from "compression";
import * as express from "express";
import * as fs from "fs-extra";
import adminApi from "./admin/api/admin-api";
import {AdminServer} from "./admin/admin-server";
import {Server} from "typescript-rest";
import * as _ from "lodash";
import {ApiConfig, validateApiConfig} from "./config/api";
import {GatewayConfig, validateGatewayConfig} from "./config/gateway";
import {ApiProxy} from "./proxy/proxy";
import * as Utils from "./proxy/utils";
import {ApiRateLimit} from "./throttling/throttling";
import {ApiAuth} from "./authentication/auth";
import {ApiCache} from "./cache/cache";
import {Logger} from "./logger";
import {AccessLogger} from "./express-logger";
import * as redis from "ioredis";
import * as dbConfig from "./redis";
import * as path from "path";
import {StatsConfig} from "./config/stats";
import {Stats} from "./stats/stats";
import {StatsRecorder} from "./stats/stats-recorder";

class StatsController {
    requestStats: Stats;
    statusCodeStats: Stats;
}

export class Gateway {
    private app: express.Application;
    private adminApp: express.Application;
    private apiProxy: ApiProxy;
    private apiRateLimit: ApiRateLimit;
    private apiCache: ApiCache;
    private apiAuth: ApiAuth;
    private _statsRecorder: StatsRecorder;
    private configFile: string;
    private apiServer: http.Server;
    private adminServer: http.Server;
    private _apis: Map<string, ApiConfig>;
    private _config: GatewayConfig;
    private _logger: Logger;
    private _redisClient: redis.Redis;

    constructor(gatewayConfigFile: string) {
        this.configFile = gatewayConfigFile;
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

    get statsConfig() : StatsConfig {
        return this._config.statsConfig;
    }

    get middlewarePath(): string {
        return this.config.middlewarePath;
    }

    get apis(): Array<ApiConfig> {
        let result = new Array<ApiConfig>();
        this._apis.forEach(element => {
            result.push(element);
        });
        return result;
    }

    createStats(id: string) {
        return this._statsRecorder.createStats(id, this._config.statsConfig);
    }

    start(ready?: (err?)=>void) {
        this.initialize(this.configFile, (err)=>{
            if (!err) {
                this.apiServer = this.app.listen(this.config.listenPort, ()=>{
                    this.logger.info(`Gateway listenning on port ${this.config.listenPort}`);
                    if (ready) {
                        ready();
                    }
                });
            }
        });  
    }

    startAdmin(ready?: ()=>void) {
        if (this.adminApp) {
            this.adminServer = this.adminApp.listen(this.config.adminPort, ()=>{
                this.logger.info(`Gateway Admin Server listenning on port ${this.config.adminPort}`);
                if (ready) {
                    ready();
                }
            });
        }
        else {
            console.error("You must start the Tree-Gateway before.");
        }
    }

    stop() {
        if (this.apiServer) {
            this.apiServer.close();
            this.apiServer = null;
        }
    }

    stopAdmin() {
        if (this.adminServer) {
            this.adminServer.close();
            this.adminServer = null;
        }
    }

    private loadApis(ready?: (err?) => void) {
        this._apis = new Map<string,ApiConfig>();
        let path = this.apiPath;
        fs.readdir(path, (err, files) => {
            if (err) {
                this._logger.error(`Error reading directory: ${err}`);
            }
            else {
                path = ((_.endsWith(path, '/'))?path:path+'/');
                const length = files.length;
                files.forEach((fileName, index) =>{
                    if (_.endsWith(fileName, '.json')) {
                        fs.readJson(path+fileName, (error, apiConfig: ApiConfig)=>{
                            if (error) {
                                this._logger.error(`Error reading directory: ${error}`);
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

    private loadApi(api: ApiConfig, ready?: (err?) => void) {
        validateApiConfig(api)
            .then((value:ApiConfig) => {
                this.loadValidateApi(value, ready);
            })
            .catch((err) => {
                this._logger.error(`Error loading api config: ${err.message}\n${JSON.stringify(api)}`);

                if (ready) {
                    ready(err);
                }
            });
    }

    private loadValidateApi(api: ApiConfig, ready?: (err?) => void) {
        if (this._logger.isInfoEnabled()) {
            this._logger.info(`Configuring API [${api.name}] on path: ${api.proxy.path}`);
        }
        let apiKey: string = this.getApiKey(api);
        this._apis.set(apiKey, api);
        api.proxy.path = Utils.normalizePath(api.proxy.path);
        if (!api.proxy.disableStats) {
            this.configureStatsMiddleware(this.server, api.proxy.path, api.proxy.path);
        }
        
        if (api.throttling) {
            if (this._logger.isDebugEnabled()) {
                this._logger.debug("Configuring API Rate Limits");
            }
            this.apiRateLimit.throttling(api);
        }
        if (api.authentication) {
            if (this._logger.isDebugEnabled()) {
                this._logger.debug("Configuring API Authentication");
            }
            this.apiAuth.authentication(apiKey, api);
        }
        this.apiProxy.configureProxyHeader(api);
        if (api.cache) {
            if (this._logger.isDebugEnabled()) {
                this._logger.debug("Configuring API Cache");
            }
            this.apiCache.cache(api);
        }
        if (this._logger.isDebugEnabled()) {
            this._logger.debug("Configuring API Proxy");
        }
        this.apiProxy.proxy(api);
        
        if (ready) {
            ready();
        }
    }

    private initialize(configFileName: string, ready?: (err?)=>void) {
        if (_.startsWith(configFileName, '.')) {
            configFileName = path.join(process.cwd(), configFileName);                
        }
        
        fs.readJson(configFileName, (error, gatewayConfig: GatewayConfig)=>{
            if (error) {
                console.error(`Error reading tree-gateway.json config file: ${error}`);
            }
            else {
                this.app = express();
                validateGatewayConfig(gatewayConfig, (err, value: GatewayConfig)=>{
                    if (err) {
                        console.error(`Error loading api config: ${err.message}\n${JSON.stringify(value)}`);
                        if (ready) {
                            ready(err);
                        }
                    }
                    else {
                        this.initializeConfig(configFileName, value);
                        this._logger = new Logger(this.config.logger, this);
                        this._redisClient = dbConfig.initializeRedis(this.config.database);
                        this._statsRecorder = new StatsRecorder(this);
                        this.apiProxy = new ApiProxy(this);
                        this.apiRateLimit = new ApiRateLimit(this);
                        this.apiAuth = new ApiAuth(this);
                        this.apiCache = new ApiCache(this);

                        this.configureServer(ready);
                        this.configureAdminServer();
                    }
                });
            }
        });
    }

    private initializeConfig(configFileName: string, gatewayConfig: GatewayConfig) {
        this._config = _.defaults(gatewayConfig, {
            rootPath : path.dirname(configFileName),
        });
        if (_.startsWith(this._config.rootPath, '.')) {
            this._config.rootPath = path.join(path.dirname(configFileName), this._config.rootPath);
        }

        this._config = _.defaults(this._config, {
            apiPath : path.join(this._config.rootPath, 'apis'),
            middlewarePath : path.join(this._config.rootPath, 'middleware')
        });

        if (_.startsWith(this._config.apiPath, '.')) {
            this._config.apiPath = path.join(this._config.rootPath, this._config.apiPath);                
        }
        if (_.startsWith(this._config.middlewarePath, '.')) {
            this._config.middlewarePath = path.join(this._config.rootPath, this._config.middlewarePath);                
        }
    }

    private configureServer(ready: (err?)=>void) {
        this.app.disable('x-powered-by'); 
        this.app.use(compression());
        if (this.config.underProxy) {
            this.app.enable('trust proxy'); 
        }
        if (this.config.accessLogger) {
            AccessLogger.configureAccessLoger(this.config.accessLogger, 
                        this, this.app, './logs/accessLog.log');
        }
        this.loadApis(ready);
    }

    private configureAdminServer() {
        this.adminApp = express();
        this.adminApp.disable('x-powered-by'); 
        this.adminApp.use(compression());
        if (this.config.adminLogger) {
            if (!this.config.disableAdminStats) {
                this.configureStatsMiddleware(this.adminApp, 'admin');
            }
            AccessLogger.configureAccessLoger(this.config.adminLogger, 
                        this, this.adminApp, './logs/adminAccessLog.log');
        }
        
        AdminServer.gateway = this;

        Server.buildServices(this.adminApp, ...adminApi);
    }

    private configureStatsMiddleware(server: express.Application, key: string, path?: string) {
        let stats = this.createStatsController(key);
        if (stats) {
            let handler = (req, res, next)=>{
                let p = req.path;
                stats.requestStats.registerOccurrence(p);
                let end = res.end;
                res.end = function(...args) {
                    stats.statusCodeStats.registerOccurrence(p, ''+res.statusCode);
                    res.end = end;
                    res.end.apply(res, arguments);
                };
                next();
            };
            if (path){
                if (this._logger.isDebugEnabled()) {
                    this._logger.debug(`Configuring Stats collector for accesses to [${path}].`);
                }
                server.use(path, handler);
            }
            else {
                if (this._logger.isDebugEnabled()) {
                    this._logger.debug(`Configuring Stats collector for accesses.`);
                }
                server.use(handler);
            }
        }
    }

    private createStatsController(path: string): StatsController {
        if ((this.statsConfig)) {
            let stats: StatsController = new StatsController();
            stats.requestStats = this.createStats(Stats.getStatsKey('access', path, 'request'));
            stats.statusCodeStats = this.createStats(Stats.getStatsKey('access', path, 'status'));
            
            return stats;
        }

        return null;
    }

    private getApiKey(api: ApiConfig) {
        return api.name + (api.version? '_'+api.version: '_default');
    }
}
