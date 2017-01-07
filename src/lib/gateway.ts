/// <reference path="./utils/collections.d.ts" />
"use strict";

import * as http from "http";
import * as compression from "compression";
import * as express from "express";
import adminApi from "./admin/api/admin-api";
import {AdminServer} from "./admin/admin-server";
import {Server} from "typescript-rest";
import {ApiConfig, validateApiConfig, createApiKey} from "./config/api";
import {GatewayConfig} from "./config/gateway";
import {ApiProxy} from "./proxy/proxy";
import * as Utils from "./proxy/utils";
import {ApiRateLimit} from "./throttling/throttling";
import {ApiAuth} from "./authentication/auth";
import {ApiCache} from "./cache/cache";
import {Logger} from "./logger";
import {AccessLogger} from "./express-logger";
import * as redis from "ioredis";
import * as dbConfig from "./redis";
import {StatsConfig} from "./config/stats";
import {Stats} from "./stats/stats";
import {StatsRecorder} from "./stats/stats-recorder";
import {Monitors} from "./monitor/monitors";
import {ConfigService} from "./service/api";
import {RedisConfigService} from "./service/redis";
import loadConfigFile from "./utils/config-loader";
import {MiddlewareInstaller} from "./utils/middleware-installer";
import {ConfigTopics} from "./config/events";
import * as fs from "fs-extra-promise";

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
    private apiServer: Map<string,http.Server>;
    private adminServer: Map<string,http.Server>;
    private _apis: Map<string, ApiConfig>;
    private _config: GatewayConfig;
    private _logger: Logger;
    private _redisClient: redis.Redis;
    private _redisEvents: redis.Redis;
    private _configService: ConfigService;
    private _middlewareInstaller: MiddlewareInstaller;
    private apiRoutes: Map<string, express.Router> = new Map<string, express.Router>();

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

    get redisEvents(): redis.Redis {
        return this._redisEvents;
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

    get configService(): ConfigService {
        return this._configService;
    }

    get middlewareInstaller(): MiddlewareInstaller {
        return this._middlewareInstaller;
    }

    createStats(id: string) {
        return this._statsRecorder.createStats(id, this._config.statsConfig);
    }

    start(): Promise<void> {
        let self = this;
        return new Promise<void>((resolve, reject) => {
            self.initialize()
                .then(() => {
                    self.apiServer = new Map<string,http.Server>();
                    let started = 0;
                    let expected = 0;
                    if (self.config.protocol.http) {
                        expected ++;
                        let httpServer = http.createServer(self.app);

                        self.apiServer.set('http', <http.Server>httpServer.listen(self.config.protocol.http.listenPort, ()=>{
                            self.logger.info(`Gateway listenning HTTP on port ${self.config.protocol.http.listenPort}`);
                            started ++;
                            if (started == expected) {
                                resolve();
                            }
                        }));
                    }
                    if (self.config.protocol.https) {
                        expected ++;
                        let httpsServer = self.createHttpServer();
                        self.apiServer.set('https', httpsServer.listen(self.config.protocol.https.listenPort, ()=>{
                            self.logger.info(`Gateway listenning HTTPS on port ${self.config.protocol.https.listenPort}`);
                            started ++;
                            if (started == expected) {
                                resolve();
                            }
                        }));
                    }
                })
                .catch((err) => {
                    reject(err);
                })
        });
    }

    startAdmin(): Promise<void> {
        let self = this;
        return new Promise<void>((resolve, reject) => {
            if (self.adminApp) {
                self.adminServer = new Map<string,http.Server>();
                let started = 0;
                let expected = 0;
                if (self.config.protocol.http) {
                    expected ++;
                    let httpServer = http.createServer(self.adminApp);

                    self.adminServer.set('http', <http.Server>httpServer.listen(self.config.protocol.http.adminPort, ()=>{
                        self.logger.info(`Gateway Admin Server listenning HTTP on port ${self.config.protocol.http.adminPort}`);
                        started ++;
                        if (started == expected) {
                            resolve();
                        }
                    }));
                }
                if (self.config.protocol.https) {
                    expected ++;
                    let httpsServer = self.createHttpServer();
                    self.adminServer.set('https', httpsServer.listen(self.config.protocol.https.adminPort, ()=>{
                        self.logger.info(`Gateway Admin Server listenning HTTPS on port ${self.config.protocol.https.adminPort}`);
                        started ++;
                        if (started == expected) {
                            resolve();
                        }
                    }));
                }
            }
            else {
                reject("You must start the Tree-Gateway before.");
            }
        });
    }

    stop() {
        if (this.apiServer) {
            this.apiServer.forEach(value=>{
                value.close()
            });
            this.apiServer = null;
            this.redisClient.disconnect();
            this.redisEvents.disconnect();
        }
    }

    stopAdmin() {
        if (this.adminServer) {
            this.adminServer.forEach(value=>{
                value.close()
            });
            this.adminServer = null;
        }
    }

    private createHttpServer() {
        let privateKey  = fs.readFileSync(this.config.protocol.https.privateKey, 'utf8');
        let certificate = fs.readFileSync(this.config.protocol.https.certificate, 'utf8');
        let credentials = {key: privateKey, cert: certificate};
        let https = require('https');
        return https.createServer(credentials, this.app);        
    }

    private loadApis(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._apis = new Map<string, ApiConfig>();

            this.configService.getAllApiConfig()
                .then((configs) => {
                    const loaders = configs.map((config) => {
                        return this.loadApi(config);
                    });

                    return Promise.all(loaders);
                })
                .then(() => resolve())
                .catch((err) => {
                    this.logger.error(`Error while installing API's: ${err}`);
                    reject(err);
                });
        });
    }

    private loadApi(api: ApiConfig): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            validateApiConfig(api)
                .then((value:ApiConfig) => {
                    this.loadValidateApi(value);
                    resolve();
                })
                .catch((err) => {
                    this._logger.error(`Error loading api config: ${err.message}\n${JSON.stringify(api)}`);

                    reject(err);
                });
        });
    }


    private loadValidateApi(api: ApiConfig) {
        if (this.logger.isInfoEnabled()) {
            this.logger.info(`Configuring API [${api.name}] on path: ${api.proxy.path}`);
        }
        const apiKey: string = createApiKey(api.name, api.version);
        this._apis.set(apiKey, api);
        api.proxy.path = Utils.normalizePath(api.proxy.path);
        
        const apiRouter = express.Router();
        if (!api.proxy.disableStats) {
            this.configureStatsMiddleware(apiRouter, api.proxy.path);
        }
        
        if (api.throttling) {
            if (this.logger.isDebugEnabled()) {
                this.logger.debug("Configuring API Rate Limits");
            }
            this.apiRateLimit.throttling(apiRouter, api);
        }
        if (api.authentication) {
            if (this.logger.isDebugEnabled()) {
                this.logger.debug("Configuring API Authentication");
            }
            this.apiAuth.authentication(apiRouter, apiKey, api);
        }
        this.apiProxy.configureProxyHeader(apiRouter, api);
        if (api.cache) {
            if (this.logger.isDebugEnabled()) {
                this.logger.debug("Configuring API Cache");
            }
            this.apiCache.cache(apiRouter, api);
        }
        if (this.logger.isDebugEnabled()) {
            this.logger.debug("Configuring API Proxy");
        }
        this.apiProxy.proxy(apiRouter, api);

        const initializeRouter = !this.apiRoutes.has(apiKey);
        this.apiRoutes.set(apiKey, apiRouter);
        if (initializeRouter) {
            this.server.use(api.proxy.path, (req, res, next)=>{
                if (this.apiRoutes.has(apiKey)) {
                    this.apiRoutes.get(apiKey)(req, res, next);
                }
                else {
                    next();
                }
            });
        }
    }

    removeApi(apiName: string, apiVersion: string) {
        this.apiRoutes.delete(createApiKey(apiName, apiVersion));
    }

    updateApi(apiName: string, apiVersion: string) {
        const apiKey = createApiKey(apiName, apiVersion);

        this.configService.getApiConfig(apiName, apiVersion)
            .then((apiConfig) => {
                if (apiConfig) {
                    this.loadApi(apiConfig);
                }
            })
            .catch((err) => {
                this.logger.error(`Config event lost ${apiKey}: ${err.message}`);
            });
    }

    private initialize(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
		    loadConfigFile(this.configFile)
                .then((gatewayConfig) => {
                    this._config = gatewayConfig;
                    this.app = express();

                    this._logger = new Logger(this.config.logger, this);
                    this._redisClient = dbConfig.initializeRedis(this.config.database);
                    this._redisEvents = dbConfig.initializeRedis(this.config.database);
                    this._configService = new RedisConfigService(this);
                    this._middlewareInstaller = new MiddlewareInstaller(this.redisClient, this.config.middlewarePath, this.logger);
                    this._statsRecorder = new StatsRecorder(this);
                    this.apiProxy = new ApiProxy(this);
                    this.apiRateLimit = new ApiRateLimit(this);
                    this.apiAuth = new ApiAuth(this);
                    this.apiCache = new ApiCache(this);
                    
                    Monitors.startMonitors(this);

                    this.configureServer()
                        .then(() => this.configService.subscribeEvents())
                        .then(() => {
                            this.configureAdminServer();
                            resolve();
                        })
                        .catch((err) => {
                            console.error(`Error loading api config: ${err.message}\n${JSON.stringify(this.config)}`);
                            reject(err);
                        });
                }).catch(reject);
        });
    }

    private configureServer(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.app.disable('x-powered-by'); 
            this.app.use(compression());
            if (this.config.underProxy) {
                this.app.enable('trust proxy'); 
            }
            if (this.config.accessLogger) {
                AccessLogger.configureAccessLoger(this.config.accessLogger, 
                            this, this.app, './logs');
            }

            this.middlewareInstaller.installAll()
                .then(() => this.loadApis())
                .then(resolve)
                .catch(reject);
        });
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
                        this, this.adminApp, './logs/admin');
        }
        
        AdminServer.gateway = this;

        Server.buildServices(this.adminApp, ...adminApi);
    }

    private configureStatsMiddleware(server: express.Router, key: string) {
        let stats = this.createStatsController(key);
        if (stats) {
            let handler = (req, res, next)=>{
                let p = req.path;
                stats.requestStats.registerOccurrence(p, 1);
                let end = res.end;
                res.end = function(...args) {
                    stats.statusCodeStats.registerOccurrence(p, 1, ''+res.statusCode);
                    res.end = end;
                    res.end.apply(res, arguments);
                };
                next();
            };
            if (this._logger.isDebugEnabled()) {
                this._logger.debug(`Configuring Stats collector for accesses.`);
            }
            server.use(handler);
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
}
