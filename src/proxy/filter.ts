'use strict';

import * as express from 'express';
import { Proxy } from '../config/proxy';
import { ApiConfig } from '../config/api';
import * as Groups from '../group';
import { Logger } from '../logger';
import { Inject } from 'typescript-ioc';
import { MiddlewareLoader } from '../utils/middleware-loader';

export class ProxyFilter {
    @Inject private middlewareLoader: MiddlewareLoader;
    @Inject private logger: Logger;

    buildFilters(apiRouter: express.Router, api: ApiConfig) {
        if (api.proxy.target.allow) {
            this.buildAllowFilter(apiRouter, api);
        }
        if (api.proxy.target.deny) {
            this.buildDenyFilter(apiRouter, api);
        }
        if (this.hasCustomFilter(api.proxy)) {
            this.buildCustomFilters(apiRouter, api);
        }
    }

    private buildCustomFilters(apiRouter: express.Router, api: ApiConfig) {
        if (this.logger.isDebugEnabled()) {
            this.logger.debug(`Configuring custom filters for Proxy target [${api.path}]. Filters [${JSON.stringify(api.proxy.filter)}]`);
        }

        api.proxy.filter.forEach((filter, index) => {
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
                                res.sendStatus(404);
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
                            res.sendStatus(404);
                        }
                    }).catch(err => {
                        next(err);
                    });
                });
            }
        });
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
                res.sendStatus(404);
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
                res.sendStatus(404);
            }
        });
    }

    private hasCustomFilter(proxy: Proxy) {
        return (proxy.filter && proxy.filter.length > 0);
    }
}
