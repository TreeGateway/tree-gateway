'use strict';

import * as _ from 'lodash';
import * as http from 'http';
import * as compression from 'compression';
import * as express from 'express';
import adminApi from './admin/api/admin-api';
import { UsersRest } from './admin/api/users';
import { Server, HttpError } from 'typescript-rest';
import { ApiConfig } from './config/api';
import { Logger } from './logger';
import { AccessLogger } from './express-logger';
import { ConfigService } from './service/config';
import { Configuration } from './configuration';
import * as fs from 'fs-extra-promise';
import { AutoWired, Inject, Singleton } from 'typescript-ioc';
import { ConfigEvents } from './config/events';
import * as path from 'path';
import { getMilisecondsInterval } from './utils/time-intervals';
import { ServiceDiscovery } from './pipeline/servicediscovery/service-discovery';
import { EventEmitter } from 'events';
import { RequestLogger } from './pipeline/stats/request';
import { ApiPileline } from './pipeline/api';

@Singleton
@AutoWired
export class Gateway extends EventEmitter {
    @Inject private config: Configuration;
    @Inject private logger: Logger;
    @Inject private requestLogger: RequestLogger;
    @Inject private configService: ConfigService;
    @Inject private serviceDiscovery: ServiceDiscovery;
    @Inject private apiPipeline: ApiPileline;

    private app: express.Application;
    private adminApp: express.Application;
    private apiServer: Map<string, http.Server>;
    private adminServer: Map<string, http.Server>;
    private serverRunning: boolean = false;

    constructor() {
        super();
        this.setMaxListeners(150);
    }

    get server(): express.Application {
        return this.app;
    }

    get apis(): Array<ApiConfig> {
        return this.apiPipeline.apis;
    }

    get running(): boolean {
        return this.serverRunning;
    }

    getApiConfig(apiId: string): ApiConfig {
        return this.apiPipeline.getApiConfig(apiId);
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

                        this.apiServer.set('http', <http.Server>httpServer.listen(_.toSafeInteger(this.config.gateway.protocol.http.listenPort), () => {
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
                        this.apiServer.set('https', httpsServer.listen(_.toSafeInteger(this.config.gateway.protocol.https.listenPort), () => {
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
                    this.adminServer.set('http', <http.Server>httpServer.listen(_.toSafeInteger(this.config.gateway.admin.protocol.http.listenPort), () => {
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
                    this.adminServer.set('https', httpsServer.listen(_.toSafeInteger(this.config.gateway.admin.protocol.https.listenPort), () => {
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
            if (this.apiServer) {
                let toClose = this.apiServer.size;
                if (toClose === 0) {
                    this.serverRunning = false;
                    this.apiPipeline.clearRoutes();
                    this.emit('stop', this);
                    return resolve();
                }
                this.apiServer.forEach(server => {
                    server.close(() => {
                        toClose--;
                        if (toClose === 0) {
                            this.logger.info('Gateway server stopped');
                            this.serverRunning = false;
                            this.apiPipeline.clearRoutes();
                            this.emit('stop', this);
                            resolve();
                        }
                    });
                });
                this.apiServer = null;
            } else {
                this.serverRunning = false;
                this.apiPipeline.clearRoutes();
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

    async restart(): Promise<void> {
        this.logger.info(`Gateway is restarting...`);
        await this.stopAdmin();
        await this.stop();
        await this.start();
        await this.startAdmin();
    }

    private createHttpsServer(app: express.Application) {
        const privateKey = fs.readFileSync(this.config.gateway.protocol.https.privateKey, 'utf8');
        const certificate = fs.readFileSync(this.config.gateway.protocol.https.certificate, 'utf8');
        const credentials = { key: privateKey, cert: certificate };
        const https = require('https');
        return https.createServer(credentials, app);
    }

    private async loadApis(): Promise<void> {
        const configs: Array<ApiConfig> = await this.configService.getAllApiConfig();
        await this.apiPipeline.loadApis(configs, this.server);
    }

    private async reloadApis(): Promise<void> {
        this.emit('api-reload', this);
        await this.loadApis();
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
            this.configService.installAllMiddlewares()
                .then(() => this.reloadApis())
                .then(() => {
                    this.logger.info(`Configuration package ${packageId} applied successfuly.`);
                })
                .catch(err => {
                    this.logger.error(`Error applying configuration package ${packageId}.`);
                    this.logger.inspectObject(err);
                });
        }
    }

    private async initialize(): Promise<void> {
        try {
            this.app = express();
            await this.configureServer();
            await this.configService.removeAllListeners()
                .on(ConfigEvents.CONFIG_UPDATED, (packageId: string, needsReload: boolean) => this.updateConfig(packageId, needsReload))
                .on(ConfigEvents.CIRCUIT_CHANGED, (id: string, state: string) => this.apiPipeline.circuitChanged(id, state))
                .subscribeEvents();
            await this.configureAdminServer();
            if (this.requestLogger.isGatewayRequestLogEnabled()) {
                this.requestLogger.initialize();
            }
        } catch (err) {
            this.logger.error(`Error configuring gateway server. Config File:\n${JSON.stringify(this.config.gateway)}`);
            this.logger.inspectObject(err);
            throw err;
        }
    }

    private async configureServer(): Promise<void> {
        this.app.disable('x-powered-by');
        if (!this.config.gateway.disableCompression) {
            this.app.use(compression());
        }
        if (this.config.gateway.underProxy) {
            this.app.enable('trust proxy');
        }
        if (this.config.gateway.accessLogger) {
            AccessLogger.configureAccessLoger(this.config.gateway.accessLogger,
                this.config.rootPath, this.app, './logs');
        }
        this.configureHealthcheck();
        await this.configService.installAllMiddlewares();
        await this.serviceDiscovery.loadServiceDiscoveryProviders(this.config.gateway);
        this.apiPipeline.buildGatewayFilters(this.app, this.config.gateway.filter);
        await  this.loadApis();
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
            if (!this.config.gateway.disableCompression) {
                this.adminApp.use(compression());
            }
            if (this.config.gateway.admin.accessLogger) {
                AccessLogger.configureAccessLoger(this.config.gateway.admin.accessLogger,
                    this.config.rootPath, this.adminApp, './logs/admin');
            }
            this.apiPipeline.buildGatewayFilters(this.adminApp, this.config.gateway.admin.filter);
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
                    res.json({ error: err.message, code: err.statusCode });
                } else {
                    next(err);
                }
            });
        }
    }

    private configureAdminCors() {
        if (this.config.gateway.admin.cors) {
            this.adminApp.use(this.apiPipeline.configureCors(this.config.gateway.admin.cors));
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
}
