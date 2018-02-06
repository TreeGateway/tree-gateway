'use strict';

import * as express from 'express';
import { ApiConfig } from '../config/api';
import { ApiFeaturesConfig } from '../config/gateway';
import { MiddlewareConfig } from '../config/middleware';
import * as Groups from '../group';
import { Logger } from '../logger';
import { Inject } from 'typescript-ioc';
import { MiddlewareLoader } from '../utils/middleware-loader';
import { ApiFilter as Filter } from '../config/filter';
import { NotFoundError } from '../error/errors';

export class ApiFilter {
    @Inject private middlewareLoader: MiddlewareLoader;
    @Inject private logger: Logger;

    buildApiFilters(apiRouter: express.Router, api: ApiConfig, gatewayFeatures: ApiFeaturesConfig) {
        if (api.proxy.target.allow) {
            this.buildAllowFilter(apiRouter, api);
        }
        if (api.proxy.target.deny) {
            this.buildDenyFilter(apiRouter, api);
        }
        if (this.hasCustomFilter(api)) {
            this.buildCustomFilters(apiRouter, api, gatewayFeatures);
        }
    }

    buildGatewayFilters(apiRouter: express.Router, filters: Array<MiddlewareConfig>) {
        if (filters) {
            if (this.logger.isDebugEnabled()) {
                this.logger.debug(`Configuring custom filters for Tree Gateway. Filters [${JSON.stringify(filters)}]`);
            }
            filters.forEach((filter) => {
                const filterMiddleware = this.middlewareLoader.loadMiddleware('filter', filter);
                apiRouter.use((req, res, next) => {
                    Promise.resolve(filterMiddleware(req, res)).then(result => {
                        if (result) {
                            return next();
                        }
                        if (!res.headersSent) {
                            next(new NotFoundError());
                            // res.sendStatus(404);
                        }
                    }).catch(err => {
                        next(err);
                    });
                });
            });
        }
    }

    private buildCustomFilters(apiRouter: express.Router, api: ApiConfig, gatewayFeatures: ApiFeaturesConfig) {
        if (this.logger.isDebugEnabled()) {
            this.logger.debug(`Configuring custom filters for Proxy target [${api.path}]. Filters [${JSON.stringify(api.filter)}]`);
        }

        api.filter.forEach((filter) => {
            filter = this.resolveReferences(filter, gatewayFeatures);
            const filterMiddleware = this.middlewareLoader.loadMiddleware('filter', filter.middleware);
            if (filter.group) {
                const groupValidator = Groups.buildGroupAllowFilter(api.group, filter.group);
                apiRouter.use((req, res, next) => {
                    if (groupValidator(req, res)) {
                        Promise.resolve(filterMiddleware(req, res)).then(result => {
                            if (result) {
                                return next();
                            }
                            if (!res.headersSent) {
                                next(new NotFoundError());
                                // res.sendStatus(404);
                            }
                        }).catch(err => {
                            next(err);
                        });
                    } else {
                        next();
                    }
                });
            } else {
                apiRouter.use((req, res, next) => {
                    Promise.resolve(filterMiddleware(req, res)).then(result => {
                        if (result) {
                            return next();
                        }
                        if (!res.headersSent) {
                            next(new NotFoundError());
                            // res.sendStatus(404);
                        }
                    }).catch(err => {
                        next(err);
                    });
                });
            }
        });
    }

    private resolveReferences(filter: Filter, features: ApiFeaturesConfig) {
        if (filter.use && features.filter) {
            if (features.filter[filter.use]) {
                filter.middleware = features.filter[filter.use];
            } else {
                throw new Error(`Invalid reference ${filter.use}. There is no configuration for this id.`);
            }
        }
        return filter;
    }

    private buildAllowFilter(apiRouter: express.Router, api: ApiConfig) {
        if (this.logger.isDebugEnabled()) {
            const groups = Groups.filter(api.group, api.proxy.target.allow);
            this.logger.debug(`Configuring allow filter for Proxy target [${api.path}]. Groups [${JSON.stringify(groups)}]`);
        }
        const groupValidator = Groups.buildGroupAllowFilter(api.group, api.proxy.target.allow);
        apiRouter.use((req, res, next) => {
            if (groupValidator(req, res)) {
                next();
            } else {
                next(new NotFoundError());
                // res.sendStatus(404);
            }
        });
    }

    private buildDenyFilter(apiRouter: express.Router, api: ApiConfig) {
        if (this.logger.isDebugEnabled()) {
            const groups = Groups.filter(api.group, api.proxy.target.deny);
            this.logger.debug(`Configuring deny filter for Proxy target [${api.path}]. Groups [${JSON.stringify(groups)}]`);
        }

        const groupValidator = Groups.buildGroupDenyFilter(api.group, api.proxy.target.deny);
        apiRouter.use((req, res, next) => {
            if (groupValidator(req, res)) {
                next();
            } else {
                next(new NotFoundError());
                // res.sendStatus(404);
            }
        });
    }

    private hasCustomFilter(api: ApiConfig) {
        return (api.filter && api.filter.length > 0);
    }
}
