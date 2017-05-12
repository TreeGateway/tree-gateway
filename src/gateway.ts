'use strict';

import * as http from 'http';
import * as compression from 'compression';
import * as express from 'express';
import adminApi from './admin/api/admin-api';
import { UsersRest } from './admin/api/users';
import { Server } from 'typescript-rest';
import { ApiConfig, validateApiConfig } from './config/api';
import { ApiProxy } from './proxy/proxy';
import * as Utils from './proxy/utils';
import { ApiRateLimit } from './throttling/throttling';
import { ApiCors } from './cors/cors';
import { ApiCircuitBreaker } from './circuitbreaker/circuit-breaker';
import { ApiAuth } from './authentication/auth';
import { ApiCache } from './cache/cache';
import { Logger } from './logger';
import { AccessLogger } from './express-logger';
import { Stats } from './stats/stats';
import { StatsRecorder } from './stats/stats-recorder';
import { Monitors } from './monitor/monitors';
import { ConfigService } from './service/api';
import { Configuration } from './configuration';
import * as fs from 'fs-extra-promise';
import * as os from 'os';
import { AutoWired, Inject, Singleton } from 'typescript-ioc';
import { ConfigEvents } from './config/events';
import * as path from 'path';

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
    @Inject private apiCors: ApiCors;
    @Inject private apiCircuitBreaker: ApiCircuitBreaker;
    @Inject private apiCache: ApiCache;
    @Inject private apiAuth: ApiAuth;
    @Inject private logger: Logger;
    @Inject private statsRecorder: StatsRecorder;
    @Inject private monitors: Monitors;
    @Inject private configService: ConfigService;

    private app: express.Application;
    private adminApp: express.Application;
    private apiServer: Map<string, http.Server>;
    private adminServer: Map<string, http.Server>;
    private apiRoutes: Map<string, express.Router> = new Map<string, express.Router>();
    private installedApis: Map<string, ApiConfig>;
    private serverRunning: boolean = false;

    get server(): express.Application {
        return this.app;
    }

    get apis(): Array<ApiConfig> {
        const result = new Array<ApiConfig>();
        this.installedApis.forEach(element => {
            result.push(element);
        });
        return result;
    }

    get running(): boolean {
        return this.serverRunning;
    }

    getApiConfig(apiId: string): ApiConfig {
        return this.installedApis.get(apiId);
    }

    start(): Promise<void> {
        const self = this;
        return new Promise<void>((resolve, reject) => {
            self.initialize()
                .then(() => {
                    self.apiServer = new Map<string, http.Server>();
                    let started = 0;
                    let expected = 0;
                    if (self.config.gateway.protocol.http) {
                        expected++;
                        const httpServer = http.createServer(self.app);

                        self.apiServer.set('http', <http.Server>httpServer.listen(self.config.gateway.protocol.http.listenPort, () => {
                            self.logger.info(`Gateway listenning HTTP on port ${self.config.gateway.protocol.http.listenPort}`);
                            started++;
                            if (started === expected) {
                                this.serverRunning = true;
                                resolve();
                            }
                        }));
                    }
                    if (self.config.gateway.protocol.https) {
                        expected++;
                        const httpsServer = self.createHttpsServer(self.app);
                        self.apiServer.set('https', httpsServer.listen(self.config.gateway.protocol.https.listenPort, () => {
                            self.logger.info(`Gateway listenning HTTPS on port ${self.config.gateway.protocol.https.listenPort}`);
                            started++;
                            if (started === expected) {
                                this.serverRunning = true;
                                resolve();
                            }
                        }));
                    }
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    startAdmin(): Promise<void> {
        const self = this;
        return new Promise<void>((resolve, reject) => {
            if (!self.config.gateway.admin) {
                return resolve();
            }
            if (self.adminApp) {
                self.adminServer = new Map<string, http.Server>();
                let started = 0;
                let expected = 0;
                if (self.config.gateway.admin.protocol.http) {
                    expected++;
                    const httpServer = http.createServer(self.adminApp);

                    self.adminServer.set('http', <http.Server>httpServer.listen(self.config.gateway.admin.protocol.http.listenPort, () => {
                        self.logger.info(`Gateway Admin Server listenning HTTP on port ${self.config.gateway.admin.protocol.http.listenPort}`);
                        started++;
                        if (started === expected) {
                            resolve();
                        }
                    }));
                }
                if (self.config.gateway.admin.protocol.https) {
                    expected++;
                    const httpsServer = self.createHttpsServer(self.adminApp);
                    self.adminServer.set('https', httpsServer.listen(self.config.gateway.admin.protocol.https.listenPort, () => {
                        self.logger.info(`Gateway Admin Server listenning HTTPS on port ${self.config.gateway.admin.protocol.https.listenPort}`);
                        started++;
                        if (started === expected) {
                            resolve();
                        }
                    }));
                }
            } else {
                reject('You must start the Tree-Gateway before.');
            }
        });
    }

    stop(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const self = this;
            this.monitors.stopMonitors();
            if (this.apiServer) {
                let toClose = this.apiServer.size;
                if (toClose === 0) {
                    self.serverRunning = false;
                    return resolve();
                }
                this.apiServer.forEach(server => {
                    server.close(() => {
                        toClose--;
                        if (toClose === 0) {
                            self.logger.info('Gateway server stopped');
                            self.serverRunning = false;
                            resolve();
                        }
                    });
                });
                this.apiServer = null;
            } else {
                self.serverRunning = false;
                resolve();
            }
        });
    }

    stopAdmin() {
        return new Promise<void>((resolve, reject) => {
            const self = this;
            if (this.adminServer) {
                let toClose = this.adminServer.size;
                if (toClose === 0) {
                    return resolve();
                }
                this.adminServer.forEach(server => {
                    server.close(() => {
                        toClose--;
                        if (toClose === 0) {
                            self.logger.info('Gateway Admin server stopped');
                            resolve();
                        }
                    });
                });
                this.adminServer = null;
            } else {
                resolve();
            }
        });
    }

    restart(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.logger.info(`Gateway is restarting...`);
            this.stopAdmin()
                .then(() => this.stop())
                .then(() => this.start())
                .then(() => this.startAdmin())
                .then(resolve)
                .catch(reject);
        });
    }

    private createHttpsServer(app: express.Application) {
        const privateKey = fs.readFileSync(this.config.gateway.protocol.https.privateKey, 'utf8');
        const certificate = fs.readFileSync(this.config.gateway.protocol.https.certificate, 'utf8');
        const credentials = { key: privateKey, cert: certificate };
        const https = require('https');
        return https.createServer(credentials, app);
    }

    private loadApis(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.installedApis = new Map<string, ApiConfig>();

            this.configService.getAllApiConfig()
                .then((configs: Array<ApiConfig>) => {
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
                .then((value: ApiConfig) => {
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
            this.logger.info(`Configuring API [${api.id}] on path: ${api.path}`);
        }

        this.installedApis.set(api.id, api);
        api.path = Utils.normalizePath(api.path);

        const apiRouter = express.Router();
        if (!api.proxy.disableStats) {
            this.configureStatsMiddleware(apiRouter, api.path);
        }

        if (api.throttling) {
            if (this.logger.isDebugEnabled()) {
                this.logger.debug('Configuring API Rate Limits');
            }
            this.apiRateLimit.throttling(apiRouter, api);
        }
        if (api.cors) {
            if (this.logger.isDebugEnabled()) {
                this.logger.debug('Configuring API Cors support');
            }
            this.apiCors.cors(apiRouter, api);
        }
        if (api.circuitBreaker) {
            if (this.logger.isDebugEnabled()) {
                this.logger.debug('Configuring API Circuit Breaker');
            }
            this.apiCircuitBreaker.circuitBreaker(apiRouter, api);
        }
        if (api.authentication) {
            if (this.logger.isDebugEnabled()) {
                this.logger.debug('Configuring API Authentication');
            }
            this.apiAuth.authentication(apiRouter, api.id, api);
        }
        this.apiProxy.configureProxyHeader(apiRouter, api);
        if (api.cache) {
            if (this.logger.isDebugEnabled()) {
                this.logger.debug('Configuring API Cache');
            }
            this.apiCache.cache(apiRouter, api);
        }
        if (this.logger.isDebugEnabled()) {
            this.logger.debug('Configuring API Proxy');
        }

        this.apiProxy.proxy(apiRouter, api);

        const initializeRouter = !this.apiRoutes.has(api.id);
        this.apiRoutes.set(api.id, apiRouter);
        if (initializeRouter) {
            this.server.use(api.path, (req, res, next) => {
                if (this.apiRoutes.has(api.id)) {
                    this.apiRoutes.get(api.id)(req, res, next);
                } else {
                    next();
                }
            });
        }
    }

    private circuitChanged(id: string, state: string) {
        this.apiCircuitBreaker.onStateChanged(id, state);
    }

    private updateConfig(packageId: string, needsReload: boolean) {
        if (needsReload) {
            this.config.reload()
                .then(() => this.restart())
                .catch((error) => this.logger.error(`Error updating gateway config. Error: ${JSON.stringify(error)}`));
        } else {
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
    }

    private removeOldAPIs() {
        this.apiRoutes.forEach((value, apiId) => {
            if (!this.installedApis.has(apiId)) {
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
                .then(() => self.configService.removeAllListeners()
                    .on(ConfigEvents.CONFIG_UPDATED, (packageId: string, needsReload: boolean) => self.updateConfig(packageId, needsReload))
                    .on(ConfigEvents.CIRCUIT_CHANGED, (id: string, state: string) => self.circuitChanged(id, state))
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
        if (this.config.gateway.admin.cors) {
            const cors = require('cors');
            const corsOptions = new ApiCors().configureCorsOptions(this.config.gateway.admin.cors);
            this.adminApp.use(cors(corsOptions));
        }
    }

    private configureApiDocs() {
        if (this.config.gateway.admin.apiDocs) {
            const isTest = process.env.NODE_ENV === 'test';

            const schemes = (this.config.gateway.admin.protocol.https ? ['https'] : ['http']);
            const host = (this.config.gateway.admin.protocol.https ?
                `${isTest?'localhost':os.hostname()}:${this.config.gateway.admin.protocol.https.listenPort}` :
                `${isTest?'localhost':os.hostname()}:${this.config.gateway.admin.protocol.http.listenPort}`);
            const swaggerFile = isTest ?
                            './dist/admin/api/swagger.json' :
                            path.join(__dirname, './admin/api/swagger.json');

            Server.swagger(this.adminApp, swaggerFile, this.config.gateway.admin.apiDocs, host, schemes);
        }
    }

    private configureStatsMiddleware(server: express.Router, key: string) {
        const stats = this.createStatsController(key);
        if (stats) {
            const handler = (req: express.Request, res: express.Response, next: express.NextFunction) => {
                const p = req.path;
                stats.requestStats.registerOccurrence(p, 1);
                const end = res.end;
                res.end = function(...args: any[]) {
                    stats.statusCodeStats.registerOccurrence(p, 1, '' + res.statusCode);
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
            const stats: StatsController = new StatsController();
            stats.requestStats = this.statsRecorder.createStats(Stats.getStatsKey('access', path, 'request'));
            stats.statusCodeStats = this.statsRecorder.createStats(Stats.getStatsKey('access', path, 'status'));

            return stats;
        }

        return null;
    }
}
