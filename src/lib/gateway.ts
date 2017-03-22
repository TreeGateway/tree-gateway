/// <reference path="./utils/collections.d.ts" />
"use strict";

import * as http from "http";
import * as compression from "compression";
import * as express from "express";
import adminApi from "./admin/api/admin-api";
import {UsersRest} from "./admin/api/users";
import {Server} from "typescript-rest";
import {ApiConfig, validateApiConfig} from "./config/api";
import {GatewayConfig} from "./config/gateway";
import {ApiProxy} from "./proxy/proxy";
import * as Utils from "./proxy/utils";
import {ApiRateLimit} from "./throttling/throttling";
import {ApiCors} from "./cors/cors";
import {ApiCircuitBreaker} from "./circuitbreaker/circuit-breaker";
import {ApiAuth} from "./authentication/auth";
import {ApiCache} from "./cache/cache";
import {Logger} from "./logger";
import {AccessLogger} from "./express-logger";
import {Stats} from "./stats/stats";
import {StatsRecorder} from "./stats/stats-recorder";
import {Monitors} from "./monitor/monitors";
import {ConfigService} from "./service/api";
import {Configuration} from "./configuration";
import * as fs from "fs-extra-promise";
import * as path from "path";
import * as os from "os";
import * as _ from "lodash";
import {AutoWired, Inject, Singleton} from "typescript-ioc";
import {MiddlewareInstaller} from "./utils/middleware-installer";
import {ConfigEvents} from "./config/events";

class StatsController {
    requestStats: Stats;
    statusCodeStats: Stats;
}

@Singleton
@AutoWired
export class Gateway {
    @Inject private config: Configuration;
    @Inject private apiProxy: ApiProxy;
    @Inject private apiRateLimit: ApiRateLimit;
    @Inject private apiCors: ApiCors
    @Inject private apiCircuitBreaker: ApiCircuitBreaker;
    @Inject private apiCache: ApiCache;
    @Inject private apiAuth: ApiAuth;
    @Inject private logger: Logger;
    @Inject private statsRecorder: StatsRecorder;
    @Inject private monitors: Monitors;
    @Inject private middlewareInstaller: MiddlewareInstaller;
    @Inject private configService: ConfigService;

    private app: express.Application;
    private adminApp: express.Application;
    private apiServer: Map<string,http.Server>;
    private adminServer: Map<string,http.Server>;
    private apiRoutes: Map<string, express.Router> = new Map<string, express.Router>();
    private _apis: Map<string, ApiConfig>;
    private _running: boolean = false;

    get server(): express.Application {
        return this.app;
    }

    get apis(): Array<ApiConfig> {
        let result = new Array<ApiConfig>();
        this._apis.forEach(element => {
            result.push(element);
        });
        return result;
    }

    get running(): boolean {
        return this._running;
    }

    getApiConfig(apiId: string): ApiConfig {
        return this._apis.get(apiId);
    }

    start(): Promise<void> {
        let self = this;
        return new Promise<void>((resolve, reject) => {
            self.initialize()
                .then(() => {
                    self.apiServer = new Map<string,http.Server>();
                    let started = 0;
                    let expected = 0;
                    if (self.config.gateway.protocol.http) {
                        expected ++;
                        let httpServer = http.createServer(self.app);

                        self.apiServer.set('http', <http.Server>httpServer.listen(self.config.gateway.protocol.http.listenPort, ()=>{
                            self.logger.info(`Gateway listenning HTTP on port ${self.config.gateway.protocol.http.listenPort}`);
                            started ++;
                            if (started == expected) {
                                this._running = true;
                                resolve();
                            }
                        }));
                    }
                    if (self.config.gateway.protocol.https) {
                        expected ++;
                        let httpsServer = self.createHttpsServer();
                        self.apiServer.set('https', httpsServer.listen(self.config.gateway.protocol.https.listenPort, ()=>{
                            self.logger.info(`Gateway listenning HTTPS on port ${self.config.gateway.protocol.https.listenPort}`);
                            started ++;
                            if (started == expected) {
                                this._running = true;
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
            if (!self.config.gateway.admin) {
                return resolve();
            }
            if (self.adminApp) {
                self.adminServer = new Map<string,http.Server>();
                let started = 0;
                let expected = 0;
                if (self.config.gateway.admin.protocol.http) {
                    expected ++;
                    let httpServer = http.createServer(self.adminApp);

                    self.adminServer.set('http', <http.Server>httpServer.listen(self.config.gateway.admin.protocol.http.listenPort, ()=>{
                        self.logger.info(`Gateway Admin Server listenning HTTP on port ${self.config.gateway.admin.protocol.http.listenPort}`);
                        started ++;
                        if (started == expected) {
                            resolve();
                        }
                    }));
                }
                if (self.config.gateway.admin.protocol.https) {
                    expected ++;
                    let httpsServer = self.createHttpsServer();
                    self.adminServer.set('https', httpsServer.listen(self.config.gateway.admin.protocol.https.listenPort, ()=>{
                        self.logger.info(`Gateway Admin Server listenning HTTPS on port ${self.config.gateway.admin.protocol.https.listenPort}`);
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

    stop(): Promise<void> {
        return new Promise<void>((resolve, reject)=>{
            let self = this;
            this.monitors.stopMonitors();
            if (this.apiServer) {
                let toClose = this.apiServer.size;
                if (toClose === 0) {
                    self._running = false;
                    return resolve();
                }
                this.apiServer.forEach(server=>{
                    server.close(()=>{
                        toClose--;
                        if (toClose === 0) {
                            self.logger.info('Gateway server stopped');
                            self._running = false;
                            resolve();
                        }
                    });
                });
                this.apiServer = null;
            }
            else {
                self._running = false;
                resolve();
            }
        });
    }

    stopAdmin() {
        return new Promise<void>((resolve, reject)=>{
            let self = this;
            if (this.adminServer) {
                let toClose = this.adminServer.size;
                if (toClose === 0) {
                    return resolve();
                }
                this.adminServer.forEach(server=>{
                    server.close(()=>{
                        toClose--;
                        if (toClose === 0) {
                            self.logger.info('Gateway Admin server stopped');
                            resolve();
                        }
                    });
                });
                this.adminServer = null;
            }
            else {
                resolve();
            }
        });
    }

    private createHttpsServer() {
        let privateKey  = fs.readFileSync(this.config.gateway.protocol.https.privateKey, 'utf8');
        let certificate = fs.readFileSync(this.config.gateway.protocol.https.certificate, 'utf8');
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
                    this.logger.error(`Error loading api config: ${err.message}\n${JSON.stringify(api)}`);

                    reject(err);
                });
        });
    }


    private loadValidateApi(api: ApiConfig) {
        if (this.logger.isInfoEnabled()) {
            this.logger.info(`Configuring API [${api.id}] on path: ${api.proxy.path}`);
        }

        this._apis.set(api.id, api);
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
        if (api.cors) {
            if (this.logger.isDebugEnabled()) {
                this.logger.debug("Configuring API Cors support");
            }
            this.apiCors.cors(apiRouter, api);
        }
        if (api.circuitBreaker) {
            if (this.logger.isDebugEnabled()) {
                this.logger.debug("Configuring API Circuit Breaker");
            }
            this.apiCircuitBreaker.circuitBreaker(apiRouter, api);
        }
        if (api.authentication) {
            if (this.logger.isDebugEnabled()) {
                this.logger.debug("Configuring API Authentication");
            }
            this.apiAuth.authentication(apiRouter, api.id, api);
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

        const initializeRouter = !this.apiRoutes.has(api.id);
        this.apiRoutes.set(api.id, apiRouter);
        if (initializeRouter) {
            this.server.use(api.proxy.path, (req, res, next)=>{
                if (this.apiRoutes.has(api.id)) {
                    this.apiRoutes.get(api.id)(req, res, next);
                }
                else {
                    next();
                }
            });
        }
    }

    private circuitChanged(id: string, state: string) {
        this.apiCircuitBreaker.onStateChanged(id, state);
    }
    
    private updateConfig(packageId: string) {
        this.apiCircuitBreaker.removeAllBreakers();
        this.configService.installAllMiddlewares()
            .then(() => this.loadApis())
            .then(() => {
                this.removeOldAPIs();
                this.logger.info(`Configuration package ${packageId} applied successfuly.`);
            })
            .catch(err => {
                this.logger.error(`Error applying configuration package ${packageId}. Error: ${JSON.stringify(err)}`);
            });
    }
    
    private removeOldAPIs() {
        this.apiRoutes.forEach((value, apiId) => {
            if (!this._apis.has(apiId)) {
                this.apiRoutes.delete(apiId);
            }
        });
    }

    private initialize(): Promise<void> {
       const self = this;
        return new Promise<void>((resolve, reject) => {
            self.app = express();
            self.monitors.startMonitors();

            self.configureServer()
                .then(() => self.configService
                                .on(ConfigEvents.CONFIG_UPDATED, (packageId) => self.updateConfig(packageId))
                                .on(ConfigEvents.CIRCUIT_CHANGED, (id, state) => self.circuitChanged(id, state))
                                .subscribeEvents())
                .then(() => {
                    self.configureAdminServer();
                    resolve();
                })
                .catch((err) => {
                    self.logger.error(`Error configuring gateway server: ${err.message}\n${JSON.stringify(this.config.gateway)}`);
                    reject(err);
                });
        });
    }

    private configureServer(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.app.disable('x-powered-by'); 
            this.app.use(compression());
            if (this.config.gateway.underProxy) {
                this.app.enable('trust proxy'); 
            }
            if (this.config.gateway.accessLogger) {
                AccessLogger.configureAccessLoger(this.config.gateway.accessLogger, 
                            this.config.rootPath, this.app, './logs');
            }

            this.configService.installAllMiddlewares()
                .then(() => this.loadApis())
                .then(resolve)
                .catch(reject);
        });
    }

    private configureAdminServer() {
        if (this.config.gateway.admin) {
            this.adminApp = express();
            this.adminApp.disable('x-powered-by'); 
            this.adminApp.use(compression());
            if (this.config.gateway.admin.accessLogger) {
                if (!this.config.gateway.admin.disableStats) {
                    this.configureStatsMiddleware(this.adminApp, 'admin');
                }
                AccessLogger.configureAccessLoger(this.config.gateway.admin.accessLogger, 
                            this.config.rootPath, this.adminApp, './logs/admin');
            }
            this.configureAdminCors();
            this.configureApiDocs();

            UsersRest.configureAuthMiddleware(this.adminApp);
            Server.buildServices(this.adminApp, ...adminApi);
        }
    }

    private configureAdminCors() {
        if (this.config.gateway.admin.cors){
            let cors = require("cors");
            let corsOptions = new ApiCors().configureCorsOptions(this.config.gateway.admin.cors);            
            this.adminApp.use(cors(corsOptions));
        }
    }

    private configureApiDocs() {
        if (this.config.gateway.admin.apiDocs){
            const swaggerUi = require('swagger-ui-express');
            const swaggerDocument = require('./admin/api/swagger.json');

            if (this.config.gateway.admin.protocol.https) {
                swaggerDocument.host = `${os.hostname()}:${this.config.gateway.admin.protocol.https.listenPort}`
                swaggerDocument.schemes = ['https'];
            }
            else if (this.config.gateway.admin.protocol.http) {
                swaggerDocument.host = `${os.hostname()}:${this.config.gateway.admin.protocol.http.listenPort}`
                swaggerDocument.schemes = ['http'];
            }
            
            this.adminApp.use(path.join('/', this.config.gateway.admin.apiDocs), swaggerUi.serve, swaggerUi.setup(swaggerDocument));
        }
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
            if (this.logger.isDebugEnabled()) {
                this.logger.debug(`Configuring Stats collector for accesses.`);
            }
            server.use(handler);
        }
    }

    private createStatsController(path: string): StatsController {
        if ((this.config.gateway.statsConfig)) {
            let stats: StatsController = new StatsController();
            stats.requestStats = this.statsRecorder.createStats(Stats.getStatsKey('access', path, 'request'));
            stats.statusCodeStats = this.statsRecorder.createStats(Stats.getStatsKey('access', path, 'status'));
            
            return stats;
        }

        return null;
    }
}
