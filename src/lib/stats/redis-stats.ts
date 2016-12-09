"use strict";

import {StatsConfig, GranularityConfig} from "../config/stats";
import {StatsHandler} from "./stats";
import * as ioredis from "ioredis";
import {calculateSeconds} from "../utils/time";
import {Gateway} from "../gateway";

export class RedisStats extends StatsHandler {
    gateway: Gateway;
    ttl: number;
    duration: number
    prefix: string;

    constructor(id: string, config: StatsConfig, gateway: Gateway) {
        super(id, config);
        this.gateway = gateway;
        this.prefix = config.prefix;
        this.duration = calculateSeconds(config.granularity.duration);
        this.ttl = calculateSeconds(config.granularity.ttl);
    }

    /**
     * Record a hit for the specified stats key
     */
    registerOccurrence(key: string) {
        let keyTimestamp = this.getRoundedTime(this.ttl);
        let tmpKey = [this.prefix, this.id, key, keyTimestamp].join(':');
        let hitTimestamp = this.getRoundedTime(this.duration);

        this.gateway.redisClient.multi()
            .hincrby(tmpKey, hitTimestamp, 1)
            .expireat(tmpKey, keyTimestamp + 2 * this.ttl)
            .exec((err, res)=>{
                if (err) {
                    this.gateway.logger.error(`Error on stats recording: ${err}`);
                }
            });
    }

    /**
     *  Get current timestamp in seconds
     */ 
    private getCurrentTime() {
        return Math.floor(Date.now() / 1000);
    }

    /**
     * Round timestamp to the 'precision' interval (in seconds)
     */
    private getRoundedTime(precision: number, time?: number) {
        time = time || this.getCurrentTime();
        return Math.floor(time / precision) * precision;
    }  
}