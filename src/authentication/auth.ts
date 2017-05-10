'use strict';

import { ApiConfig } from '../config/api';
import { AuthenticationConfig } from '../config/authentication';
import * as _ from 'lodash';
import * as pathUtil from 'path';
import * as auth from 'passport';
import { Stats } from '../stats/stats';
import * as Groups from '../group';
import * as express from 'express';
import { Logger } from '../logger';
import { AutoWired, Inject } from 'typescript-ioc';
import { Configuration } from '../configuration';
import { StatsRecorder } from '../stats/stats-recorder';

const providedStrategies: any = {
    'basic': require('./strategies/basic'),
    'jwt': require('./strategies/jwt'),
    'local': require('./strategies/local')
};

class StatsController {
    failStats: Stats;
    successStats: Stats;
}

@AutoWired
export class ApiAuth {
    @Inject
    private config: Configuration;
    @Inject
    private logger: Logger;
    @Inject
    private statsRecorder: StatsRecorder;

    authentication(apiRouter: express.Router, apiKey: string, api: ApiConfig) {
        const path: string = api.path;
        const authentication: AuthenticationConfig = api.authentication;
        _.keys(authentication.strategy).forEach(key => {
            try {
                const authConfig = (<any>authentication).strategy[key];
                let authStrategy: auth.Strategy;
                if (_.has(providedStrategies, key)) {
                    const strategy = providedStrategies[key];
                    authStrategy = strategy(authConfig, this.config);
                } else {
                    const p = pathUtil.join(this.config.middlewarePath, 'authentication', 'strategy', key);
                    const strategy = require(p);
                    authStrategy = strategy(authConfig);
                }
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
                        this.logger.debug(`Authentication Strategy [${key}] configured for path [${path}]`);
                    }
                }
            } catch (e) {
                this.logger.error(`Error configuring Authentication Strategy [${key}] for path [${path}]`, e);
            }
        });
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
            this.logger.debug(`Configuring Group filters for Authentication on path [${api.path}]. Groups [${JSON.stringify(groups)}]`);
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
