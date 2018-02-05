'use strict';

import { ApiFeaturesConfig } from '../config/gateway';
import { ApiCircuitBreakerConfig } from '../config/circuit-breaker';
import { ApiConfig } from '../config/api';
import { Stats } from '../stats/stats';
import * as express from 'express';
import * as _ from 'lodash';
import { CircuitBreaker } from './express-circuit-breaker';
import * as Groups from '../group';
import { RedisStateHandler } from './redis-state-handler';
import { Logger } from '../logger';
import { AutoWired, Inject } from 'typescript-ioc';
import { StatsRecorder } from '../stats/stats-recorder';
import { getMilisecondsInterval } from '../utils/time-intervals';
import { MiddlewareLoader } from '../utils/middleware-loader';

class StatsController {
    open: Stats;
    close: Stats;
    rejected: Stats;
}

interface BreakerInfo {
    circuitBreaker?: CircuitBreaker;
    groupValidator?: (req: express.Request, res: express.Response) => boolean;
}

@AutoWired
export class ApiCircuitBreaker {
    @Inject private logger: Logger;
    @Inject private statsRecorder: StatsRecorder;
    @Inject private middlewareLoader: MiddlewareLoader;

    private activeBreakers: Map<string, CircuitBreaker> = new Map<string, CircuitBreaker>();

    circuitBreaker(apiRouter: express.Router, api: ApiConfig, gatewayFeatures: ApiFeaturesConfig) {
        const breakerInfos: Array<BreakerInfo> = new Array<BreakerInfo>();
        const sortedBreakers = this.sortBreakers(api.circuitBreaker, api.path);
        const breakersSize = sortedBreakers.length;
        sortedBreakers.forEach((cbConfig: ApiCircuitBreakerConfig, index: number) => {
            cbConfig = this.resolveReferences(cbConfig, gatewayFeatures);
            const breakerInfo: BreakerInfo = {};
            const cbStateID = (breakersSize > 1 ? `${api.path}:${index}` : api.path);
            const cbOptions: any = {
                id: cbStateID,
                maxFailures: (cbConfig.maxFailures || 10),
                rejectMessage: (cbConfig.rejectMessage || 'Service unavailable'),
                rejectStatusCode: (cbConfig.rejectStatusCode || 503),
                stateHandler: new RedisStateHandler(cbStateID,
                                    getMilisecondsInterval(cbConfig.resetTimeout, 120000),
                                    getMilisecondsInterval(cbConfig.timeWindow)),
                timeout: getMilisecondsInterval(cbConfig.timeout, 30000),
                timeoutMessage: (cbConfig.timeoutMessage || 'Operation timeout'),
                timeoutStatusCode: (cbConfig.timeoutStatusCode || 504)
            };
            if (this.logger.isDebugEnabled()) {
                this.logger.debug(`Configuring Circuit Breaker for path [${api.path}].`);
            }
            breakerInfo.circuitBreaker = new CircuitBreaker(cbOptions);
            this.configureCircuitBreakerEventListeners(breakerInfo, api.path, cbConfig, api.id);
            if (cbConfig.group) {
                if (this.logger.isDebugEnabled()) {
                    const groups = Groups.filter(api.group, cbConfig.group);
                    this.logger.debug(`Configuring Group filters for Circuit Breaker on path [${api.path}]. Groups [${JSON.stringify(groups)}]`);
                }
                breakerInfo.groupValidator = Groups.buildGroupAllowFilter(api.group, cbConfig.group);
            }
            breakerInfos.push(breakerInfo);
        });

        this.setupMiddlewares(apiRouter, breakerInfos);
    }

    onStateChanged(id: string, state: string) {
        const breaker: CircuitBreaker = this.activeBreakers.get(id);
        if (breaker) {
            breaker.onStateChanged(state);
        }
    }

    removeBreaker(id: string) {
        this.activeBreakers.delete(id);
    }

    removeAllBreakers() {
        this.activeBreakers.clear();
    }

    private resolveReferences(circuitBreaker: ApiCircuitBreakerConfig, features: ApiFeaturesConfig) {
        if (circuitBreaker.use && features.circuitBreaker) {
            if (features.circuitBreaker[circuitBreaker.use]) {
                circuitBreaker = _.defaults(circuitBreaker, features.circuitBreaker[circuitBreaker.use]);
            } else {
                throw new Error(`Invalid reference ${circuitBreaker.use}. There is no configuration for this id.`);
            }
        }
        return circuitBreaker;
    }

    private configureCircuitBreakerEventListeners(breakerInfo: BreakerInfo, path: string, config: ApiCircuitBreakerConfig, apiId: string) {
        const stats = this.createCircuitBreakerStats(apiId, config);
        if (stats) {
            breakerInfo.circuitBreaker.on('open', (req: express.Request) => {
                stats.open.registerOccurrence(req, 1);
            });
            breakerInfo.circuitBreaker.on('close', (req: express.Request) => {
                stats.close.registerOccurrence(req, 1);
            });
            breakerInfo.circuitBreaker.on('rejected', (req: express.Request) => {
                stats.rejected.registerOccurrence(req, 1);
            });
        }
        if (config.onOpen) {
            const openHandler = this.middlewareLoader.loadMiddleware('circuitbreaker', config.onOpen);
            breakerInfo.circuitBreaker.on('open', () => {
                openHandler(path, 'open', apiId);
            });
        }
        if (config.onClose) {
            const closeHandler = this.middlewareLoader.loadMiddleware('circuitbreaker', config.onClose);
            breakerInfo.circuitBreaker.on('close', () => {
                closeHandler(path, 'close', apiId);
            });
        }
        if (config.onRejected) {
            const rejectedHandler = this.middlewareLoader.loadMiddleware('circuitbreaker', config.onRejected);
            breakerInfo.circuitBreaker.on('rejected', () => {
                rejectedHandler(path, 'rejected', apiId);
            });
        }
    }

    private setupMiddlewares(apiRouter: express.Router, breakerInfos: Array<BreakerInfo>) {
        breakerInfos.forEach((breakerInfo: BreakerInfo) => {
            this.activeBreakers.set(breakerInfo.circuitBreaker.id, breakerInfo.circuitBreaker);
            apiRouter.use(this.buildMiddleware(breakerInfo));
        });
    }

    private buildMiddleware(breakerInfo: BreakerInfo) {
        const circuitBreakerMiddleware = breakerInfo.circuitBreaker.middleware();

        return (req: express.Request, res: express.Response, next: express.NextFunction) => {
            if (breakerInfo.groupValidator) {
                if (breakerInfo.groupValidator(req, res)) {
                    circuitBreakerMiddleware(req, res, next);
                } else {
                    next();
                }
            } else {
                circuitBreakerMiddleware(req, res, next);
            }
        };
    }

    private sortBreakers(breakers: Array<ApiCircuitBreakerConfig>, path: string): Array<ApiCircuitBreakerConfig> {
        const generalBreakers = _.filter(breakers, (value) => {
            if (value.group) {
                return true;
            }
            return false;
        });

        if (generalBreakers.length > 1) {
            this.logger.error(`Invalid circuit breaker configuration for api [${path}]. Conflicting configurations for default group`);
            return [];
        }

        if (generalBreakers.length > 0) {
            const index = breakers.indexOf(generalBreakers[0]);
            if (index < breakers.length - 1) {
                const gen = breakers.splice(index, 1);
                breakers.push(gen[0]);
            }
        }
        return breakers;
    }

    private createCircuitBreakerStats(apiId: string, config: ApiCircuitBreakerConfig): StatsController {
        if (!config.disableStats) {
            const stats: StatsController = new StatsController();
            stats.close = this.statsRecorder.createStats(Stats.getStatsKey('circuitbreaker', apiId, 'close'), config.statsConfig);
            stats.open = this.statsRecorder.createStats(Stats.getStatsKey('circuitbreaker', apiId, 'open'), config.statsConfig);
            stats.rejected = this.statsRecorder.createStats(Stats.getStatsKey('circuitbreaker', apiId, 'rejected'), config.statsConfig);

            if (stats.open) {
                return stats;
            }
        }

        return null;
    }
}
