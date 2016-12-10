"use strict";

import {StatsConfig} from "../config/stats";

export class Stats {
    private statsHandler: StatsHandler;
    constructor(statsHandler: StatsHandler) {
        this.statsHandler = statsHandler;
    }

    registerOccurrence(value: string){
        setTimeout(()=>{
            this.statsHandler.registerOccurrence(value);
        }, 0);
    }

    getOccurrences(key: string, time: number, callback: (err:Error, serie?: Array<Array<number>>)=>void) {
        setTimeout(()=>{
            this.statsHandler.getOccurrences(key, time, callback);
        }, 0);
    }

    getLastOccurrences(key: string, count: number, callback: (err:Error, serie?: Array<Array<number>>)=>void) {
        setTimeout(()=>{
            this.statsHandler.getLastOccurrences(key, count, callback);
        }, 0);
    }


    static getStatsKey(prefix: string, key: string, path: string, ...opt: Array<string>) {
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

    abstract registerOccurrence(value: string);
    abstract getOccurrences(key: string, time: number, callback: (err:Error, serie?: Array<Array<number>>)=>void);
    abstract getLastOccurrences(key: string, count: number, callback: (err:Error, serie?: Array<Array<number>>)=>void);
}