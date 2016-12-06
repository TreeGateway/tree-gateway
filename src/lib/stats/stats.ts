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
}

export abstract class StatsHandler {
    id: string;
    private config: StatsConfig;
    private timer: NodeJS.Timer;

    constructor(id: string, config: StatsConfig) {
        this.id = id;
        this.config = config;
    }

    registerOccurrence(value: string){
        if (!this.timer) {
            this.newWindow();
        }
        this.registerOccurenceOnWindow(value);        
    } 

    getMeasurements() {
        return this.config.measurements;
    }

    findOccurrences(){
        return[];
    }

    private newWindow() {
        this.createWindow();
        this.timer = setTimeout(()=>{
            this.onWindowClosed();
            this.timer = null;
        }, this.config.windowMS);
    }

    abstract createWindow();
    abstract registerOccurenceOnWindow(value: string);
    abstract onWindowClosed();
}