'use strict';

import * as express from 'express';
import { ApiConfig } from '../config/api';
import { ApiCorsConfig } from '../config/cors';
import * as _ from 'lodash';
import * as pathUtil from 'path';
import * as Groups from '../group';
import * as corsMiddleware from 'cors';
import { Logger } from '../logger';
import { AutoWired, Inject } from 'typescript-ioc';
import { Configuration } from '../configuration';

const humanInterval = require('human-interval');

interface CorsInfo {
    corsMiddleware?: express.RequestHandler;
    corsPreFlightPath?: Array<string>;
    groupValidator?: (req: express.Request, res: express.Response) => boolean;
}

@AutoWired
export class ApiCors {
    @Inject
    private config: Configuration;
    @Inject
    private logger: Logger;

    cors(apiRouter: express.Router, api: ApiConfig) {
        const path: string = api.path;
        const configusrations: Array<ApiCorsConfig> = this.sortMiddlewares(api.cors, path);
        const corsInfos: Array<CorsInfo> = new Array<CorsInfo>();

        configusrations.forEach((cors: ApiCorsConfig) => {
            const corsInfo: CorsInfo = {};
            const corsOptions: corsMiddleware.CorsOptions = this.configureCorsOptions(cors);
            corsInfo.corsMiddleware = corsMiddleware(corsOptions);

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

    configureCorsOptions(cors: ApiCorsConfig): corsMiddleware.CorsOptions {
        const corsOptions: corsMiddleware.CorsOptions = _.omit(cors, 'id', 'origin', 'maxAge', 'group');
        if (cors.maxAge) {
            corsOptions.maxAge = humanInterval(cors.maxAge);
        }
        if (cors.origin.enableAll) {
            corsOptions.origin = true;
        } else if (cors.origin.disableAll) {
            corsOptions.origin = false;
        } else if (cors.origin.allow) {
            if (_.filter(cors.origin.allow, obj => obj.value === '*').length > 0) {
                corsOptions.origin = true;
            } else {
                corsOptions.origin = <string[]>cors.origin.allow.map(originConfig => {
                    if (originConfig.value) {
                        return originConfig.value;
                    } else {
                        return new RegExp(originConfig.regexp);
                    }
                });
            }
        } else if (cors.origin.dynamic) {
            const p = pathUtil.join(this.config.middlewarePath, 'cors', 'origin', cors.origin.dynamic);
            corsOptions.origin = require(p);
        }
        return corsOptions;
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
