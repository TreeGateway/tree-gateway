'use strict';

import * as corsLib from 'cors';
import * as express from 'express';
import * as _ from 'lodash';
import { AutoWired, Inject } from 'typescript-ioc';
import { ApiConfig } from '../../config/api';
import { ApiCorsConfig } from '../../config/cors';
import { ApiPipelineConfig } from '../../config/gateway';
import { Logger } from '../../logger';
import { MiddlewareLoader } from '../../utils/middleware-loader';
import { getMilisecondsInterval } from '../../utils/time-intervals';
import * as Groups from '../group';

interface CorsInfo {
    corsMiddleware?: express.RequestHandler;
    corsPreFlightPath?: Array<string>;
    groupValidator?: (req: express.Request, res: express.Response) => boolean;
}

@AutoWired
export class ApiCors {
    @Inject private logger: Logger;
    @Inject private middlewareLoader: MiddlewareLoader;

    public cors(apiRouter: express.Router, api: ApiConfig, pipelineConfig: ApiPipelineConfig) {
        const path: string = api.path;
        const configusrations: Array<ApiCorsConfig> = this.sortMiddlewares(api.cors, path);
        const corsInfos: Array<CorsInfo> = new Array<CorsInfo>();

        configusrations.forEach((cors: ApiCorsConfig) => {
            cors = this.resolveReferences(cors, pipelineConfig);
            const corsInfo: CorsInfo = {};
            const corsOptions: corsLib.CorsOptions = this.configureCorsOptions(cors);
            corsInfo.corsMiddleware = corsLib(corsOptions);

            if (this.logger.isDebugEnabled()) {
                this.logger.debug(`Configuring Cors for path [${api.path}].`);
            }
            if (cors.group) {
                if (this.logger.isDebugEnabled()) {
                    const groups = Groups.filter(api.group, cors.group);
                    this.logger.debug(`Configuring Group filters for Cors on path [${api.path}]. Groups [${JSON.stringify(groups)}]`);
                }
                corsInfo.groupValidator = Groups.buildGroupAllowFilter(api.group, cors.group);
            }
            corsInfos.push(corsInfo);
        });

        this.setupMiddlewares(apiRouter, corsInfos);
    }

    public configureCorsOptions(cors: ApiCorsConfig): corsLib.CorsOptions {
        const corsOptions: corsLib.CorsOptions = _.omit(cors, 'id', 'origin', 'maxAge', 'group') as any;
        if (cors.maxAge) {
            corsOptions.maxAge = getMilisecondsInterval(cors.maxAge);
        }
        if (cors.origin.enableAll) {
            corsOptions.origin = true;
        } else if (cors.origin.disableAll) {
            corsOptions.origin = false;
        } else if (cors.origin.allow) {
            if (_.filter(cors.origin.allow, obj => obj.value === '*').length > 0) {
                corsOptions.origin = true;
            } else {
                corsOptions.origin = cors.origin.allow.map(originConfig => {
                    if (originConfig.value) {
                        return originConfig.value;
                    } else {
                        return new RegExp(originConfig.regexp);
                    }
                }) as Array<string>;
            }
        } else if (cors.origin.middleware) {
            const corsMiddleware = this.middlewareLoader.loadMiddleware('cors/origin', cors.origin.middleware);
            corsOptions.origin = (origin: string, callback: (error?: any, value?: boolean) => void) => {
                Promise.resolve(corsMiddleware(origin))
                    .then(result => {
                        callback(null, result);
                    }).catch(error => {
                        callback(error);
                    });
            };
        }
        return corsOptions;
    }

    private resolveReferences(cors: ApiCorsConfig, pipelineConfig: ApiPipelineConfig) {
        if (cors.use && pipelineConfig.cors) {
            if (pipelineConfig.cors[cors.use]) {
                cors = _.defaults(cors, pipelineConfig.cors[cors.use]);
            } else {
                throw new Error(`Invalid reference ${cors.use}. There is no configuration for this id.`);
            }
        }
        return cors;
    }

    private setupMiddlewares(apiRouter: express.Router, corsInfos: Array<CorsInfo>) {
        corsInfos.forEach((corsInfo: CorsInfo) => {
            const middleware = this.buildMiddleware(corsInfo);
            apiRouter.use(middleware);
        });
    }

    private buildMiddleware(corsInfo: CorsInfo) {
        return (req: express.Request, res: express.Response, next: express.NextFunction) => {
            if (corsInfo.groupValidator) {
                if (corsInfo.groupValidator(req, res)) {
                    corsInfo.corsMiddleware(req, res, next);
                } else {
                    next();
                }
            } else {
                corsInfo.corsMiddleware(req, res, next);
            }
        };
    }

    private sortMiddlewares(corsConfigs: Array<ApiCorsConfig>, path: string): Array<ApiCorsConfig> {
        const generalThrottlings = _.filter(corsConfigs, (value) => {
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
            const index = corsConfigs.indexOf(generalThrottlings[0]);
            if (index < corsConfigs.length - 1) {
                const gen = corsConfigs.splice(index, 1);
                corsConfigs.push(gen[0]);
            }
        }
        return corsConfigs;
    }
}
