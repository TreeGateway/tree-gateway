'use strict';

import * as http from 'http';
import * as compression from 'compression';
import * as express from 'express';
import adminApi from './admin/api/admin-api';
import { UsersRest } from './admin/api/users';
import { Server, HttpError } from 'typescript-rest';
import { ApiConfig, validateApiConfig } from './config/api';
import { StatsConfig } from './config/stats';
import { ApiProxy } from './proxy/proxy';
import * as Utils from './proxy/utils';
import { ApiRateLimit } from './throttling/throttling';
import { ApiCors } from './cors/cors';
import { ApiCircuitBreaker } from './circuitbreaker/circuit-breaker';
import { ApiAuth } from './authentication/auth';
import { ApiCache } from './cache/cache';
import { ApiFilter } from './filter/filter';
import { Logger } from './logger';
import { AccessLogger } from './express-logger';
import { Stats } from './stats/stats';
import { StatsRecorder } from './stats/stats-recorder';
import { Monitors } from './monitor/monitors';
import { ConfigService } from './service/config';
import { Configuration } from './configuration';
import * as fs from 'fs-extra-promise';
import { AutoWired, Inject, Singleton } from 'typescript-ioc';
import { ConfigEvents } from './config/events';
import * as path from 'path';
import * as cors from 'cors';
import { getMilisecondsInterval } from './utils/time-intervals';
import { ServiceDiscovery } from './servicediscovery/service-discovery';
import { EventEmitter } from 'events';

class StatsController {
    requestStats: Stats;
    statusCodeStats: Stats;
}

@Singleton
@AutoWired
export class Gateway extends EventEmitter {
    @Inject private config: Configuration;
    @Inject private apiProxy: ApiProxy;
    @Inject private apiRateLimit: ApiRateLimit;
    @Inject private apiCors: ApiCors;
    @Inject private apiCircuitBreaker: ApiCircuitBreaker;
    @Inject private apiCache: ApiCache;
    @Inject private apiAuth: ApiAuth;
    @Inject private apiFilter: ApiFilter;
    @Inject private logger: Logger;
    @Inject private statsRecorder: StatsRecorder;
    @Inject private monitors: Monitors;
    @Inject private configService: ConfigService;
    @Inject private serviceDiscovery: ServiceDiscovery;

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
        return new Promise<void>((resolve, reject) => {
            this.initialize()
                .then(() => {
                    this.apiServer = new Map<string, http.Server>();
                    let started = 0;
                    let expected = 0;
                    if (this.config.gateway.protocol.http) {
                        expected++;
                        const httpServer = http.createServer(this.app);

                        this.apiServer.set('http', <http.Server>httpServer.listen(this.config.gateway.protocol.http.listenPort, () => {
                            this.logger.info(`Gateway listenning HTTP on port ${this.config.gateway.protocol.http.listenPort}`);
                            started++;
                            if (started === expected) {
                                this.serverRunning = true;
                                this.emit('start', this);
                                resolve();
                            }
                        }));
                    }
                    if (this.config.gateway.protocol.https) {
                        expected++;
                        const httpsServer = this.createHttpsServer(this.app);
                        this.apiServer.set('https', httpsServer.listen(this.config.gateway.protocol.https.listenPort, () => {
                            this.logger.info(`Gateway listenning HTTPS on port ${this.config.gateway.protocol.https.listenPort}`);
                            started++;
                            if (started === expected) {
                                this.serverRunning = true;
                                this.emit('start', this);
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
        return new Promise<void>((resolve, reject) => {
            if (!this.config.gateway.admin) {
                return resolve();
            }
            if (this.adminApp) {
                this.adminServer = new Map<string, http.Server>();
                let started = 0;
                let expected = 0;
                if (this.config.gateway.admin.protocol.http) {
                    expected++;
                    const httpServer = http.createServer(this.adminApp);
                    httpServer.timeout = getMilisecondsInterval(this.config.gateway.timeout, 60000);
                    this.adminServer.set('http', <http.Server>httpServer.listen(this.config.gateway.admin.protocol.http.listenPort, () => {
                        this.logger.info(`Gateway Admin Server listenning HTTP on port ${this.config.gateway.admin.protocol.http.listenPort}`);
                        started++;
                        if (started === expected) {
                            this.emit('admin-start', this);
                            resolve();
                        }
                    }));
                }
                if (this.config.gateway.admin.protocol.https) {
                    expected++;
                    const httpsServer = this.createHttpsServer(this.adminApp);
                    httpsServer.timeout = getMilisecondsInterval(this.config.gateway.timeout, 60000);
                    this.adminServer.set('https', httpsServer.listen(this.config.gateway.admin.protocol.https.listenPort, () => {
                        this.logger.info(`Gateway Admin Server listenning HTTPS on port ${this.config.gateway.admin.protocol.https.listenPort}`);
                        started++;
                        if (started === expected) {
                            this.emit('admin-start', this);
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
            this.monitors.stopMonitors();
            if (this.apiServer) {
                let toClose = this.apiServer.size;
                if (toClose === 0) {
                    this.serverRunning = false;
                    this.apiRoutes.clear();
                    this.emit('stop', this);
                    return resolve();
                }
                this.apiServer.forEach(server => {
                    server.close(() => {
                        toClose--;
                        if (toClose === 0) {
                            this.logger.info('Gateway server stopped');
                            this.serverRunning = false;
                            this.apiRoutes.clear();
                            this.emit('stop', this);
                            resolve();
                        }
                    });
                });
                this.apiServer = null;
            } else {
                this.serverRunning = false;
                this.apiRoutes.clear();
                this.emit('stop', this);
                resolve();
            }
        });
    }

    stopAdmin() {
        return new Promise<void>((resolve, reject) => {
            if (this.adminServer) {
                let toClose = this.adminServer.size;
                if (toClose === 0) {
                    this.emit('admin-stop', this);
                    return resolve();
                }
                this.adminServer.forEach(server => {
                    server.close(() => {
                        toClose--;
                        if (toClose === 0) {
                            this.logger.info('Gateway Admin server stopped');
                            this.emit('admin-stop', this);
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
            this.configureStatsMiddleware(apiRouter, api.id, api.proxy.statsConfig);
        }
        this.apiFilter.buildApiFilters(apiRouter, api);

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
        } else {
            this.configureDefaultCors(apiRouter);
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
                .then(() => {
                    this.logger.info(`Configuration reloaded. Restarting server...`);
                    return this.restart();
                })
                .then(() => {
                    this.logger.info(`Server restarted.`);
                    this.logger.info(`Configuration package ${packageId} applied successfuly.`);
                })
                .catch((error) => {
                    this.logger.error(`Error updating gateway config.`);
                    this.logger.inspectObject(error);
                });
        } else {
            this.apiCircuitBreaker.removeAllBreakers();
            this.configService.installAllMiddlewares()
                .then(() => this.loadApis())
                .then(() => {
                    this.removeOldAPIs();
                    this.logger.info(`Configuration package ${packageId} applied successfuly.`);
                })
                .catch(err => {
                    this.logger.error(`Error applying configuration package ${packageId}.`);
                    this.logger.inspectObject(err);
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
        return new Promise<void>((resolve, reject) => {
            this.app = express();
            this.monitors.startMonitors();

            this.configureServer()
                .then(() => this.configService.removeAllListeners()
                    .on(ConfigEvents.CONFIG_UPDATED, (packageId: string, needsReload: boolean) => this.updateConfig(packageId, needsReload))
                    .on(ConfigEvents.CIRCUIT_CHANGED, (id: string, state: string) => this.circuitChanged(id, state))
                    .subscribeEvents())
                .then(() => {
                    this.configureAdminServer();
                    resolve();
                })
                .catch((err) => {
                    this.logger.error(`Error configuring gateway server. Config File:\n${JSON.stringify(this.config.gateway)}`);
                    this.logger.inspectObject(err);
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
            this.configureHealthcheck();
            this.configService.installAllMiddlewares()
                .then(() => this.serviceDiscovery.loadServiceDiscoveryProviders(this.config.gateway))
                .then(() => {
                    this.apiFilter.buildGatewayFilters(this.app, this.config.gateway.filter);
                    return this.loadApis();
                })
                .then(resolve)
                .catch(reject);
        });
    }

    private configureHealthcheck() {
        if (this.config.gateway.healthcheck) {
            this.app.get(this.config.gateway.healthcheck, (req: express.Request, res: express.Response) => {
                res.write('OK');
                res.end();
            });
        }
    }

    private configureAdminServer() {
        if (this.config.gateway.admin) {
            this.adminApp = express();
            this.adminApp.disable('x-powered-by');
            this.adminApp.use(compression());
            if (this.config.gateway.admin.accessLogger) {
                if (!this.config.gateway.admin.disableStats) {
                    this.configureStatsMiddleware(this.adminApp, 'admin', this.config.gateway.admin.statsConfig);
                }
                AccessLogger.configureAccessLoger(this.config.gateway.admin.accessLogger,
                    this.config.rootPath, this.adminApp, './logs/admin');
            }
            this.apiFilter.buildGatewayFilters(this.adminApp, this.config.gateway.admin.filter);
            this.configureAdminCors();
            this.configureApiDocs();

            UsersRest.configureAuthMiddleware(this.adminApp);
            Server.buildServices(this.adminApp, ...adminApi);

            this.adminApp.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
                if (err instanceof HttpError) {
                    if (res.headersSent) { // important to allow default error handler to close connection if headers already sent
                        return next(err);
                    }
                    res.status(err.statusCode);
                    res.json({error : err.message, code: err.statusCode});
                } else {
                    next(err);
                }
            });
        }
    }

    private configureAdminCors() {
        if (this.config.gateway.admin.cors) {
            const corsOptions = new ApiCors().configureCorsOptions(this.config.gateway.admin.cors);
            this.adminApp.use(cors(corsOptions));
        }
    }

    private configureApiDocs() {
        if (this.config.gateway.admin.apiDocs) {
            const isTest = process.env.NODE_ENV === 'test';

            const schemes = (this.config.gateway.admin.protocol.https ? ['https'] : ['http']);
            const swaggerFile = isTest ?
                './dist/admin/api/swagger.json' :
                path.join(__dirname, './admin/api/swagger.json');

            const apiPath = this.config.gateway.admin.apiDocs.path;
            const apiHost = this.config.gateway.admin.apiDocs.host;
            Server.swagger(this.adminApp, swaggerFile, apiPath, apiHost, schemes);
        }
    }

    private configureDefaultCors(apiRouter: express.Router) {
        if (this.config.gateway.cors) {
            const corsOptions = new ApiCors().configureCorsOptions(this.config.gateway.cors);
            apiRouter.use(cors(corsOptions));
        }
    }

    private configureStatsMiddleware(server: express.Router, key: string, statsConfig: StatsConfig) {
        const stats = this.createStatsController(key, statsConfig);
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

    private createStatsController(apiId: string, statsConfig: StatsConfig): StatsController {
        if ((this.config.gateway.statsConfig || statsConfig)) {
            const stats: StatsController = new StatsController();
            stats.requestStats = this.statsRecorder.createStats(Stats.getStatsKey('access', apiId, 'request'), statsConfig);
            stats.statusCodeStats = this.statsRecorder.createStats(Stats.getStatsKey('access', apiId, 'status'), statsConfig);

            return stats;
        }

        return null;
    }
}
