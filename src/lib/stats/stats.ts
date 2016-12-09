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

    static getStatsKey(prefix: string, key: string, path: string) {
        let result: Array<string> = [];
        result.push(prefix);
        result.push(path);
        result.push(key);
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

    findOccurrences(){
        return[];
    }

    abstract registerOccurrence(value: string);
}