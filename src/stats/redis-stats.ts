'use strict';

import * as _ from 'lodash';
import { StatsConfig } from '../config/stats';
import { StatsHandler } from './stats';
import { Logger } from '../logger';
import { AutoWired, Inject } from 'typescript-ioc';
import { Database } from '../database';
import {getMilisecondsInterval} from '../utils/time-intervals';

class Constants {
    static STATS_SYNC = 'STATS_SYNC';
}

@AutoWired
export class RedisStats extends StatsHandler {
    id: string;
    ttl: number;
    duration: number;
    prefix: string;

    @Inject private logger: Logger;
    @Inject private database: Database;

    initialize(id: string, config: StatsConfig) {
        this.id = id;
        this.prefix = config.prefix;
        this.duration = getMilisecondsInterval(config.granularity.duration) / 1000;
        this.ttl = getMilisecondsInterval(config.granularity.ttl) / 1000;
    }

    private getKey(key: string, keyTimestamp: number, extra: string[]) {
        let tmpKeys;
        if (extra && extra.length > 0) {
            tmpKeys = _.concat([this.prefix, this.id, key], extra);
            tmpKeys.push(`${keyTimestamp}`);
        } else {
            tmpKeys = [this.prefix, this.id, key, keyTimestamp];
        }

        const tmpKey = tmpKeys.join(':');
        return tmpKey;
    }

    /**
     * Record a hit for the specified stats key
     */
    registerOccurrence(key: string, increment: number, ...extra: string[]) {
        setTimeout(() => {
            const keyTimestamp = this.getRoundedTime(this.ttl);
            const tmpKey = this.getKey(key, keyTimestamp, extra);
            const hitTimestamp = this.getRoundedTime(this.duration);

            this.database.redisClient.multi()
                .hincrby(tmpKey, hitTimestamp, increment)
                .expireat(tmpKey, keyTimestamp + 2 * this.ttl)
                .sadd(Constants.STATS_SYNC, JSON.stringify({ key: tmpKey, duration: this.duration, ttl: this.ttl }))
                .exec((err, res) => {
                    if (err) {
                        this.logger.error(`Error on stats recording: ${err}`);
                    }
                });
        }, 0);
    }

    /**
     * Get a time serie whith the last 'count' measurements recorded.
     */
    getLastOccurrences(count: number, key: string, ...extra: string[]): Promise<Array<Array<number>>> {
        const currentTime: number = this.getCurrentTime();
        if (count > this.ttl / this.duration) {
            return new Promise<Array<Array<number>>>((resolve, reject) => {
                setTimeout(() => {
                    reject(new Error(`Count: ${count} exceeds the maximum stored slots for configured granularity.`));
                }, 0);
            });
        }
        return this.getOccurrencesForTime(currentTime - count * this.duration, currentTime, key, extra);
    }

    /**
     * Get a time serie starting from the 'time' moment.
     */
    getOccurrences(time: number, key: string, ...extra: string[]): Promise<Array<Array<number>>> {
        const currentTime: number = this.getCurrentTime();
        return this.getOccurrencesForTime(time, currentTime, key, extra);
    }

    private getOccurrencesForTime(time: number, currentTime: number,
        key: string, extra: string[]): Promise<Array<Array<number>>> {
        return new Promise<Array<Array<number>>>((resolve, reject) => {
            const from: number = this.getRoundedTime(this.duration, time);
            const to: number = this.getRoundedTime(this.duration, currentTime);

            const hgets = new Array();

            for (let ts = from; ts <= to; ts += this.duration) {
                const keyTimestamp = this.getRoundedTime(this.ttl, ts);
                const tmpKey = this.getKey(key, keyTimestamp, extra);
                hgets.push(this.database.redisClient.hget(tmpKey, ts));
            }

            Promise.all(hgets)
                .then((results) => {
                    const data = [];
                    for (let ts = from, i = 0; ts <= to; ts += this.duration, i += 1) {
                        data.push([ts, (<any>results)[i][1] ? parseInt((<any>results)[i][1], 10) : 0]);
                    }

                    if (this.logger.isDebugEnabled()) {
                        this.logger.debug(`Retrieving stats for key ${key}: ${JSON.stringify(data)}`);
                    }
                    return resolve(data);
                })
                .catch(reject);
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
