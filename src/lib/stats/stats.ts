"use strict";

import {StatsConfig} from "../config/stats";

export class Stats {
    private statsHandler: StatsHandler;
    constructor(statsHandler: StatsHandler) {
        this.statsHandler = statsHandler;
    }

    registerOccurrence(value: string, increment: number, ...extra: string[]){
        return this.statsHandler.registerOccurrence.apply(this.statsHandler, arguments);
    }

    getOccurrences(time: number, key: string): Promise<Array<Array<number>>> {
        return this.statsHandler.getOccurrences.apply(this.statsHandler, arguments);
    }

    getLastOccurrences(count: number, key: string): Promise<Array<Array<number>>> {
        return this.statsHandler.getLastOccurrences.apply(this.statsHandler, arguments);
    }

    static getStatsKey(prefix: string, path: string, key: string, ...opt: Array<string>) {
        let result: Array<string> = [];
        result.push(prefix);
        result.push(path);
        result.push(key);

        if (opt) {
            result = result.concat(opt);
        }
        return result.join(':');
    }  
}

export abstract class StatsHandler {
    id: string;
    private config: StatsConfig;

    constructor(id: string, config: StatsConfig) {
        this.id = id;
        this.config = config;
    }

    abstract registerOccurrence(value: string, increment: number, ...extra: string[]);
    abstract getOccurrences(time: number, key: string): Promise<Array<Array<number>>> ;
    abstract getLastOccurrences(count: number, key: string): Promise<Array<Array<number>>>;
}