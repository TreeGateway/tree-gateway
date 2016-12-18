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
    registerOccurrence(key: string, increment: number, ...extra: string[]) {
        setTimeout(()=>{
            let keyTimestamp = this.getRoundedTime(this.ttl);
            let tmpKeys = [this.prefix, this.id, key, keyTimestamp];
            let tmpKey = tmpKeys.join(':');
            if (extra && extra.length > 0) {
                tmpKey += ':'+extra.join(':');
            }
            let hitTimestamp = this.getRoundedTime(this.duration);

            this.gateway.redisClient.multi()
                .hincrby(tmpKey, hitTimestamp, increment)
                .expireat(tmpKey, keyTimestamp + 2 * this.ttl)
                .exec((err, res)=>{
                    if (err) {
                        this.gateway.logger.error(`Error on stats recording: ${err}`);
                    }
                });
        },0);
    }

    /**
     * Get a time serie whit the last 'count' measurements recorded. 
     */
    getLastOccurrences(count: number, key: string, ...extra: string[]): Promise<Array<Array<number>>> {
        let currentTime: number = this.getCurrentTime();
        if (count > this.ttl / this.duration) {
            return new Promise<Array<Array<number>>>((resolve, reject)=>{
                setTimeout(()=>{
                    reject(new Error(`Count: ${count} exceeds the maximum stored slots for configured granularity.`));
                }, 0);
            });
        }
        return this.getOccurrencesForTime(currentTime - count*this.duration, currentTime, key, extra);
    }
    
    /**
     * Get a time serie whit starting from the 'time' moment. 
     */
    getOccurrences(time: number, key: string, ...extra: string[]): Promise<Array<Array<number>>> {
        let currentTime: number = this.getCurrentTime();
        return this.getOccurrencesForTime(time, currentTime, key, extra);
    }
    
    private getOccurrencesForTime(time: number, currentTime: number, key: string, extra: string[]): Promise<Array<Array<number>>> {
        return new Promise<Array<Array<number>>>((resolve, reject)=>{
            let from: number = this.getRoundedTime(this.duration, time);
            let to: number = this.getRoundedTime(this.duration, currentTime);
            let multi: ioredis.Pipeline = this.gateway.redisClient.multi();

            for(let ts=from; ts<=to; ts+=this.duration) {
                let keyTimestamp = this.getRoundedTime(this.ttl, ts);
                let tmpKeys = [this.prefix, this.id, key, keyTimestamp];
                let tmpKey = tmpKeys.join(':');
                if (extra && extra.length > 0) {
                    tmpKey += ':'+extra.join(':');
                }

                multi.hget(tmpKey, ts);
            }

            multi.exec((err, results) => {
                if (err) {
                    return reject(err);
                }
                let data=[];
                for(let ts=from, i=0; ts<=to; ts+=this.duration, i+=1) {
                    data.push([ts, results[i][1] ? parseInt(results[i][1], 10) : 0]);
                }

                if (this.gateway.logger.isDebugEnabled()) {
                    this.gateway.logger.debug(`Retrieving stats for key ${key}: ${JSON.stringify(data)}`);
                }

                return resolve(data);
            });
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