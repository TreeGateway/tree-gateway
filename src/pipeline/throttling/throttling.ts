'use strict';

import * as express from 'express';
import { ApiConfig } from '../../config/api';
import { ApiThrottlingConfig } from '../../config/throttling';
import { ApiFeaturesConfig } from '../../config/gateway';
import * as _ from 'lodash';
import * as Groups from '../group';
import { RedisStore } from './redis-store';
import { Logger } from '../../logger';
import { AutoWired, Inject } from 'typescript-ioc';
import { getMilisecondsInterval } from '../../utils/time-intervals';
import { MiddlewareLoader } from '../../utils/middleware-loader';
import { ProxyError } from '../error/errors';
import { RequestLogger } from '../stats/request';

interface ThrottlingInfo {
    limiter?: express.RequestHandler;
    groupValidator?: (req: express.Request, res: express.Response) => boolean;
}

@AutoWired
export class ApiRateLimit {
    @Inject private logger: Logger;
    @Inject private middlewareLoader: MiddlewareLoader;
    @Inject private requestLogger: RequestLogger;

    throttling(apiRouter: express.Router, api: ApiConfig, gatewayFeatures: ApiFeaturesConfig) {
        const path: string = api.path;
        const throttlings: Array<ApiThrottlingConfig> = this.sortLimiters(api.throttling, path);
        const rateLimit = require('express-rate-limit');
        const throttlingInfos: Array<ThrottlingInfo> = new Array<ThrottlingInfo>();

        throttlings.forEach((throttling: ApiThrottlingConfig) => {
            throttling = this.resolveReferences(throttling, gatewayFeatures);
            const throttlingInfo: ThrottlingInfo = {};
            const rateConfig: any = _.defaults(_.omit(throttling, 'store', 'keyGenerator', 'handler', 'group', 'timeWindow', 'delay'), {
                message: 'Too many requests, please try again later.',
                statusCode: 429
            }
            );
            rateConfig.windowMs = getMilisecondsInterval(throttling.timeWindow, 60000);
            rateConfig.delayMs = getMilisecondsInterval(throttling.delay, 0);
            rateConfig.store = new RedisStore({
                expire: (rateConfig.windowMs / 1000) + 1,
                path: path
            });

            if (throttling.keyGenerator) {
                rateConfig.keyGenerator = this.middlewareLoader.loadMiddleware('throttling/keyGenerator', throttling.keyGenerator);
            }
            if (throttling.skip) {
                rateConfig.skip = this.middlewareLoader.loadMiddleware('throttling/skip', throttling.skip);
            }
            this.configureThrottlingHandlerFunction(path, throttling, rateConfig, api);
            throttlingInfo.limiter = new rateLimit(rateConfig);

            if (this.logger.isDebugEnabled()) {
                this.logger.debug(`Configuring Throtlling controller for path [${api.path}].`);
            }
            if (throttling.group) {
                if (this.logger.isDebugEnabled()) {
                    const groups = Groups.filter(api.group, throttling.group);
                    this.logger.debug(`Configuring Group filters for Throtlling on path [${api.path}]. Groups [${JSON.stringify(groups)}]`);
                }
                throttlingInfo.groupValidator = Groups.buildGroupAllowFilter(api.group, throttling.group);
            }
            throttlingInfos.push(throttlingInfo);
        });

        this.setupMiddlewares(apiRouter, throttlingInfos);
    }

    private resolveReferences(throttling: ApiThrottlingConfig, features: ApiFeaturesConfig) {
        if (throttling.use && features.throttling) {
            if (features.throttling[throttling.use]) {
                throttling = _.defaults(throttling, features.throttling[throttling.use]);
            } else {
                throw new Error(`Invalid reference ${throttling.use}. There is no configuration for this id.`);
            }
        }
        return throttling;
    }

    private configureThrottlingHandlerFunction(path: string, throttling: ApiThrottlingConfig, rateConfig: any, api: ApiConfig) {
        if (this.requestLogger.isRequestLogEnabled(api)) {
            if (throttling.handler) {
                const customHandler = this.middlewareLoader.loadMiddleware('throttling/handler', throttling.handler);
                rateConfig.handler = (req: express.Request, res: express.Response, next: express.NextFunction) => {
                    const requestLog = this.requestLogger.getRequestLog(req);
                    if (requestLog) {
                        requestLog.throttling = 'exceeded';
                    }
                    customHandler(req, res, next);
                };
            } else {
                rateConfig.handler = (req: express.Request, res: express.Response, next: express.NextFunction) => {
                    const requestLog = this.requestLogger.getRequestLog(req);
                    if (requestLog) {
                        requestLog.throttling = 'exceeded';
                    }
                    next(new ProxyError(rateConfig.message, rateConfig.statusCode));
                };
            }
        } else if (throttling.handler) {
            rateConfig.handler = this.middlewareLoader.loadMiddleware('throttling/handler', throttling.handler);
        }
    }

    private setupMiddlewares(apiRouter: express.Router, throttlingInfos: Array<ThrottlingInfo>) {
        throttlingInfos.forEach((throttlingInfo: ThrottlingInfo) => {
            apiRouter.use(this.buildMiddleware(throttlingInfo));
        });
    }

    private buildMiddleware(throttlingInfo: ThrottlingInfo) {
        return (req: express.Request, res: express.Response, next: express.NextFunction) => {
            if (throttlingInfo.groupValidator) {
                if (throttlingInfo.groupValidator(req, res)) {
                    throttlingInfo.limiter(req, res, next);
                } else {
                    next();
                }
            } else {
                throttlingInfo.limiter(req, res, next);
            }
        };
    }

    private sortLimiters(throttlings: Array<ApiThrottlingConfig>, path: string): Array<ApiThrottlingConfig> {
        const generalThrottlings = _.filter(throttlings, (value) => {
            if (value.group) {
                return true;
            }
            return false;
        });

        if (generalThrottlings.length > 1) {
            this.logger.error(`Invalid throttling configuration for api [${path}]. Conflicting configurations for default group`);
            return [];
        }

        if (generalThrottlings.length > 0) {
            const index = throttlings.indexOf(generalThrottlings[0]);
            if (index < throttlings.length - 1) {
                const gen = throttlings.splice(index, 1);
                throttlings.push(gen[0]);
            }
        }
        return throttlings;
    }
}
