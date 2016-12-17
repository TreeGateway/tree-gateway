"use strict";

import {Gateway} from "../gateway";
import {Stats} from "./stats";
import {StatsConfig} from "../config/stats";
import {RedisStats} from "./redis-stats";
import * as _ from "lodash";

export class StatsRecorder {
    private gateway: Gateway;

    constructor(gateway: Gateway) {
        this.gateway = gateway;
    }

    createStats(id: string, config: StatsConfig) {
        let stats: Stats = null;
        try{
            config = _.defaults(config, {
                prefix: 'stats'
            });

            if (this.gateway.logger.isDebugEnabled()) {
                this.gateway.logger.debug(`Creating a stats recorder for ${id} on Redis database`);
            }
            stats = new Stats(new RedisStats(id, config, this.gateway));
        } catch (e) {
            this.gateway.logger.error(e);
        }
        return stats;
    }
}
