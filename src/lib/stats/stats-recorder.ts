"use strict";

import {Gateway} from "../gateway";
import {Stats} from "./stats";
import {StatsConfig} from "../config/stats";
import {RedisStats} from "./redis-stats";
import * as _ from "lodash";
import {Logger} from "../logger";
import {AutoWired, Singleton, Inject} from "typescript-ioc";
import {Configuration} from "../configuration";

@AutoWired
@Singleton
export class StatsRecorder {
    @Inject
    private logger: Logger;
    @Inject
    private config: Configuration;

    createStats(id: string, statsConfig?: StatsConfig) {
        if (statsConfig || this.config.gateway.statsConfig) {
            let config = <StatsConfig>_.defaultsDeep((statsConfig||{}), (this.config.gateway.statsConfig||{}));
            
            return this.newStats(id, this.config.gateway.statsConfig);
        }

        return null;
    }

    private newStats(id: string, config: StatsConfig) {
        let stats: Stats = null;
        try{
            config = _.defaults(config, {
                prefix: 'stats'
            });

            if (this.logger.isDebugEnabled()) {
                this.logger.debug(`Creating a stats recorder for ${id} on Redis database`);
            }
            stats = new Stats(new RedisStats(id, config));
        } catch (e) {
            this.logger.error(e);
        }
        return stats;
    }
}
