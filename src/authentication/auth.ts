'use strict';

import { ApiConfig } from '../config/api';
import { AuthenticationConfig } from '../config/authentication';
import * as auth from 'passport';
import { Stats } from '../stats/stats';
import * as Groups from '../group';
import * as express from 'express';
import { Logger } from '../logger';
import { AutoWired, Inject } from 'typescript-ioc';
import { StatsRecorder } from '../stats/stats-recorder';
import { MiddlewareLoader } from '../utils/middleware-loader';

class StatsController {
    failStats: Stats;
    successStats: Stats;
}

@AutoWired
export class ApiAuth {
    @Inject private logger: Logger;
    @Inject private statsRecorder: StatsRecorder;
    @Inject private middlewareLoader: MiddlewareLoader;

    authentication(apiRouter: express.Router, apiKey: string, api: ApiConfig) {
        const path: string = api.path;
        const authentication: AuthenticationConfig = api.authentication;
        try {
            const authStrategy: auth.Strategy = this.middlewareLoader.loadMiddleware('authentication/strategy', authentication.strategy);
            if (!authStrategy) {
                this.logger.error('Error configuring authenticator. Invalid Strategy');
            } else {
                auth.use(apiKey, authStrategy);

                const authenticator = auth.authenticate(apiKey, { session: false, failWithError: true });
                if (authentication.group) {
                    this.createAuthenticatorForGroup(apiRouter, api, authentication, authenticator);
                } else {
                    this.createAuthenticator(apiRouter, api, authentication, authenticator);
                }

                if (this.logger.isDebugEnabled) {
                    this.logger.debug(`Authentication Strategy [${authentication.strategy.name}] configured for path [${path}]`);
                }
            }
        } catch (e) {
            this.logger.error(`Error configuring Authentication Strategy [${authentication.strategy.name}] for path [${path}]`, e);
        }
    }

    private createAuthenticator(apiRouter: express.Router, api: ApiConfig, authentication: AuthenticationConfig,
        authenticator: express.RequestHandler) {
        const path: string = api.path;
        const stats = this.createAuthStats(path, authentication);
        if (stats) {
            apiRouter.use((req, res, next) => {
                authenticator(req, res, (err) => {
                    if (err) {
                        stats.failStats.registerOccurrence(req.path, 1);
                        next(err);
                    } else {
                        stats.successStats.registerOccurrence(req.path, 1);
                        next();
                    }
                });
            });
        } else {
            apiRouter.use(authenticator);
        }
    }

    private createAuthenticatorForGroup(apiRouter: express.Router, api: ApiConfig, authentication: AuthenticationConfig,
        authenticator: express.RequestHandler) {
        const path: string = api.path;
        if (this.logger.isDebugEnabled()) {
            const groups = Groups.filter(api.group, authentication.group);
            this.logger.debug(`Configuring Group filters for Authentication on path [${api.path}]. Groups [${this.logger.inspectObject(groups)}]`);
        }
        const f = Groups.buildGroupAllowFilter(api.group, authentication.group);
        const stats = this.createAuthStats(path, authentication);
        if (stats) {
            apiRouter.use((req, res, next) => {
                if (f(req, res)) {
                    authenticator(req, res, (err) => {
                        if (err) {
                            stats.failStats.registerOccurrence(req.path, 1);
                            next(err);
                        } else {
                            stats.successStats.registerOccurrence(req.path, 1);
                            next();
                        }
                    });
                } else {
                    next();
                }
            });
        } else {
            apiRouter.use((req, res, next) => {
                if (f(req, res)) {
                    authenticator(req, res, next);
                } else {
                    next();
                }
            });
        }
    }

    private createAuthStats(path: string, authentication: AuthenticationConfig): StatsController {
        if (!authentication.disableStats) {
            const stats: StatsController = new StatsController();
            stats.failStats = this.statsRecorder.createStats(Stats.getStatsKey('auth', path, 'fail'), authentication.statsConfig);
            stats.successStats = this.statsRecorder.createStats(Stats.getStatsKey('auth', path, 'success'), authentication.statsConfig);

            if (stats.failStats) {
                return stats;
            }
        }

        return null;
    }
}
