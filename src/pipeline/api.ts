'use strict';

import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as express from 'express';
import * as getRawBody from 'raw-body';
import { AutoWired, Inject, Singleton } from 'typescript-ioc';
import { ApiConfig, validateApiConfig } from '../config/api';
import { ApiCorsConfig } from '../config/cors';
import { MiddlewareConfig } from '../config/middleware';
import { Configuration } from '../configuration';
import { Logger } from '../logger';
import { normalizePath } from '../utils/path';
import { ApiAuth } from './authentication/auth';
import { ApiCache } from './cache/cache';
import { ApiCircuitBreaker } from './circuitbreaker/circuit-breaker';
import { ApiCors } from './cors/cors';
import { ApiErrorHandler } from './error/error-handler';
import { ApiFilter } from './filter/filter';
import { ApiProxy } from './proxy/proxy';
import { RequestLogger } from './stats/request';
import { ApiRateLimit } from './throttling/throttling';

@Singleton
@AutoWired
export class ApiPileline {
    @Inject private config: Configuration;
    @Inject private logger: Logger;

    @Inject private apiProxy: ApiProxy;
    @Inject private apiErrorHandler: ApiErrorHandler;
    @Inject private apiRateLimit: ApiRateLimit;
    @Inject private apiCors: ApiCors;
    @Inject private apiCircuitBreaker: ApiCircuitBreaker;
    @Inject private apiCache: ApiCache;
    @Inject private apiAuth: ApiAuth;
    @Inject private apiFilter: ApiFilter;
    @Inject private requestLogger: RequestLogger;

    private apiRoutes: Map<string, express.Router> = new Map<string, express.Router>();
    private installedApis: Map<string, ApiConfig>;

    get apis(): Array<ApiConfig> {
        const result = new Array<ApiConfig>();
        this.installedApis.forEach(element => {
            result.push(element);
        });
        return result;
    }

    public getApiConfig(apiId: string): ApiConfig {
        return this.installedApis.get(apiId);
    }

    public clearRoutes() {
        this.apiRoutes.clear();
    }

    public async loadApi(api: ApiConfig, server: express.Application): Promise<void> {
        try {
            await validateApiConfig(api, this.config.gateway.disableApiIdValidation);
            await this.loadValidApi(api, server);
        } catch (err) {
            this.logger.error(`Error loading api config: ${err.message}\n${JSON.stringify(api)}`);
            throw err;
        }
    }

    public circuitChanged(id: string, state: string) {
        this.apiCircuitBreaker.onStateChanged(id, state);
    }

    public async loadApis(configs: Array<ApiConfig>, server: express.Application): Promise<void> {
        try {
            this.installedApis = new Map<string, ApiConfig>();

            const loaders = configs.map((config) => {
                return this.loadApi(config, server);
            });

            await Promise.all(loaders);
            this.removeOldAPIs();
        } catch (err) {
            this.logger.error(`Error while installing API's: ${err}`);
            throw err;
        }
    }

    public buildGatewayFilters(apiRouter: express.Router, filters: Array<MiddlewareConfig>) {
        this.apiFilter.buildGatewayFilters(apiRouter, filters);
    }

    public configureCors(config: ApiCorsConfig) {
        const corsOptions = this.apiCors.configureCorsOptions(config);
        return cors(corsOptions);
    }

    private removeOldAPIs() {
        this.apiRoutes.forEach((value, apiId) => {
            if (!this.installedApis.has(apiId)) {
                this.apiRoutes.delete(apiId);
            }
        });
    }

    private loadValidApi(api: ApiConfig, server: express.Application) {
        if (this.logger.isInfoEnabled()) {
            this.logger.info(`Configuring API [${api.id}] on path: ${api.path}`);
        }

        this.installedApis.set(api.id, api);
        api.path = normalizePath(api.path);

        const apiRouter = express.Router();
        if (this.requestLogger.isRequestLogEnabled(api)) {
            this.configureLogMiddleware(apiRouter, api);
        }
        if (api.parseCookies) {
            apiRouter.use(cookieParser());
        }
        if (api.parseReqBody) {
            this.configureBodyParser(api, apiRouter);
        }

        this.apiFilter.buildApiFilters(apiRouter, api, this.config.gateway.config);

        if (api.throttling) {
            if (this.logger.isDebugEnabled()) {
                this.logger.debug('Configuring API Rate Limits');
            }
            this.apiRateLimit.throttling(apiRouter, api, this.config.gateway.config);
        }
        if (api.cors) {
            if (this.logger.isDebugEnabled()) {
                this.logger.debug('Configuring API Cors support');
            }
            this.apiCors.cors(apiRouter, api, this.config.gateway.config);
        } else {
            this.configureDefaultCors(apiRouter);
        }
        if (api.circuitBreaker) {
            if (this.logger.isDebugEnabled()) {
                this.logger.debug('Configuring API Circuit Breaker');
            }
            this.apiCircuitBreaker.circuitBreaker(apiRouter, api, this.config.gateway.config);
        }
        if (api.authentication) {
            if (this.logger.isDebugEnabled()) {
                this.logger.debug('Configuring API Authentication');
            }
            this.apiAuth.authentication(apiRouter, api.id, api, this.config.gateway.config);
        }
        this.apiProxy.configureProxyHeader(apiRouter, api);
        if (api.cache) {
            if (this.logger.isDebugEnabled()) {
                this.logger.debug('Configuring API Cache');
            }
            this.apiCache.cache(apiRouter, api, this.config.gateway.config);
        }
        if (this.logger.isDebugEnabled()) {
            this.logger.debug('Configuring API Proxy');
        }

        this.apiProxy.proxy(apiRouter, api, this.config.gateway.config);
        this.apiErrorHandler.handle(apiRouter, api, this.config.gateway.config);

        const initializeRouter = !this.apiRoutes.has(api.id);
        this.apiRoutes.set(api.id, apiRouter);
        if (initializeRouter) {
            server.use(api.path, (req, res, next) => {
                if (this.apiRoutes.has(api.id)) {
                    this.apiRoutes.get(api.id)(req, res, next);
                } else {
                    next();
                }
            });
        }
    }

    private configureDefaultCors(apiRouter: express.Router) {
        if (this.config.gateway.cors) {
            const corsOptions = new ApiCors().configureCorsOptions(this.config.gateway.cors);
            apiRouter.use(cors(corsOptions));
        }
    }

    private configureLogMiddleware(server: express.Router, api: ApiConfig) {
        server.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            const requestLog = this.requestLogger.initRequestLog(req, api);
            const end = res.end;
            const requestLogger = this.requestLogger;
            res.end = function(...args: Array<any>) {
                requestLog.status = res.statusCode;
                requestLog.responseTime = new Date().getTime() - requestLog.timestamp;
                requestLogger.registerOccurrence(requestLog);
                res.end = end;
                res.end.apply(res, arguments);
            };
            next();
        });
    }

    private configureBodyParser(api: ApiConfig, apiRouter: express.Router) {
        const limit = api.proxy.limit || '1mb';
        let parsers: Array<string>;
        if (Array.isArray(api.parseReqBody)) {
            parsers = api.parseReqBody as Array<string>;
        } else {
            parsers = [`${api.parseReqBody}`];
        }
        parsers.forEach((parser: string) => {
            if (parser === 'json') {
                apiRouter.use(bodyParser.json({ limit: limit }));
            } else if (parser === 'urlencoded') {
                apiRouter.use(bodyParser.urlencoded({
                    extended: true,
                    limit: limit
                }));
            } else {
                apiRouter.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
                    this.maybeParseRawBody(req, limit)
                        .then((buf: any) => {
                            req.body = buf;
                            next();
                        })
                        .catch((err: any) => next(err));
                });
            }
        });
    }

    private maybeParseRawBody(req: express.Request, limit: string) {
        if (req.body) {
            return Promise.resolve(req.body);
        } else {
            return getRawBody(req, {
                length: req.headers['content-length'] as string,
                limit: limit
            });
        }
    }
}
