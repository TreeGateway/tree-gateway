'use strict';

import { StatsConfig } from '../config/stats';
import { Request } from 'express';

export interface StatsRequestMapper {
    (request: Request): string;
}

export class Stats {
    private statsHandler: StatsHandler;
    private requestMapper: StatsRequestMapper;

    constructor(statsHandler: StatsHandler, requestMapper: StatsRequestMapper) {
        this.statsHandler = statsHandler;
        this.requestMapper = requestMapper;
    }

    registerOccurrence(req: Request, increment: number, ...extra: string[]) {
        const key = (<any>req)._tg_req_key_ || this.requestMapper(req); // request can not be finished before key is extracted
        (<any>req)._tg_req_key_ = key;
        setImmediate(() => {
            this.statsHandler.registerOccurrence(key, increment, ...extra);
        });
    }

    registerMonitorOccurrence(key: string, value: number, ...extra: string[]) {
        setImmediate(() => {
            this.statsHandler.registerValue(key, value, ...extra);
        });
    }

    getOccurrences(time: number, key: string, ...extra: string[]): Promise<Array<Array<number>>> {
        return this.statsHandler.getOccurrences(time, key, ...extra);
    }

    getLastOccurrences(count: number, key: string, ...extra: string[]): Promise<Array<Array<number>>> {
        return this.statsHandler.getLastOccurrences(count, key, ...extra);
    }

    static getStatsKey(prefix: string, apiId: string, key: string, ...opt: Array<string>) {
        let result: Array<string> = [];
        result.push(prefix);
        result.push(apiId);
        result.push(key);

        if (opt) {
            result = result.concat(opt);
        }
        return result.join(':');
    }
}

export abstract class StatsHandler {
    abstract initialize(id: string, config: StatsConfig): void;
    abstract registerOccurrence(value: string, increment: number, ...extra: string[]): void;
    abstract registerValue(value: string, increment: number, ...extra: string[]): void;
    abstract getOccurrences(time: number, key: string, ...extra: string[]): Promise<Array<Array<number>>>;
    abstract getLastOccurrences(count: number, key: string, ...extra: string[]): Promise<Array<Array<number>>>;
}
