"use strict";

import {Gateway} from "../gateway";
import {Stats} from "./stats";
import {StatsConfig} from "../config/stats";
import {MemoryStats} from "./memory-stats";
import {RedisStats} from "./redis-stats";

let defaults = require('defaults');

export class StatsRecorder {
    private gateway: Gateway;

    constructor(gateway: Gateway) {
        this.gateway = gateway;
    }

    createStats(id: string, config: StatsConfig) {
        let stats: Stats = null;
        try{
            config = defaults(config, {
                prefix: 'stats'
            });

            if (this.gateway.redisClient) {
                if (this.gateway.logger.isDebugEnabled()) {
                    this.gateway.logger.debug('Creating a stats recorder for %s on Redis database', id);
                }
                stats = new Stats(new RedisStats(id, config, this.gateway));
            }
            else {
                if (this.gateway.logger.isDebugEnabled()) {
                    this.gateway.logger.debug('Creating a memory stats recorder for %s', id);
                }
                stats = new Stats(new MemoryStats(id, config));
            }
        } catch (e) {
            this.gateway.logger.error(e);
        }
        return stats;
    }
}
