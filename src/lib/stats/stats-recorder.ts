"use strict";

import {Gateway} from "../gateway";
import {Stats} from "./stats";
import {StatsConfig} from "../config/stats";
import {MemoryStats} from "./memory-stats";

let defaults = require('defaults');

export class StatsRecorder {
    private gateway: Gateway;

    constructor(gateway: Gateway) {
        this.gateway = gateway;
    }

    createStats(id: string, config: StatsConfig) {
        let stats: Stats;
        config = defaults(config, {
            measurements: 30000,
            prefix: 'stats'
        });

        if (this.gateway.redisClient) {
            if (this.gateway.logger.isDebugEnabled()) {
                this.gateway.logger.debug('Creating a stats recorder for %s on Redis database', id);
            }
        }
        else {
            stats = new Stats(new MemoryStats(id, config));
            if (this.gateway.logger.isDebugEnabled()) {
                this.gateway.logger.debug('Creating a memory stats recorder for %s', id);
            }
        }
        return stats;
    }
}
