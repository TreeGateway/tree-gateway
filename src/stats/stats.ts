'use strict';

import { StatsConfig } from '../config/stats';
import { Request } from 'express';

export interface StatsRequestMapper {
    map(request: Request): string;
}

export class Stats {
    private statsHandler: StatsHandler;
    private requestMapper: StatsRequestMapper;

    constructor(statsHandler: StatsHandler, requestMapper: StatsRequestMapper) {
        this.statsHandler = statsHandler;
        this.requestMapper = requestMapper;
    }

    registerOccurrence(req: Request, increment: number, ...extra: string[]) {
        setImmediate(() => {
            const key = this.requestMapper.map(req);
            this.statsHandler.registerOccurrence(key, increment, ...extra);
        });
    }

    registerMonitorOccurrence(key: string, increment: number, ...extra: string[]) {
        setImmediate(() => {
            this.statsHandler.registerOccurrence(key, increment, ...extra);
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
    abstract getOccurrences(time: number, key: string, ...extra: string[]): Promise<Array<Array<number>>>;
    abstract getLastOccurrences(count: number, key: string, ...extra: string[]): Promise<Array<Array<number>>>;
}
