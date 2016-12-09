"use strict";

import {StatsConfig} from "../config/stats";
import {StatsHandler} from "./stats";
import {calculateSeconds} from "../utils/time";

export class MemoryStats extends StatsHandler {
    private timer: NodeJS.Timer;
    records: Array<Map<string, number>> = new Array<Map<string, number>>();
    ocurrences: Map<string, number>;
    windowMS: number;
    maxRecords: number;

    constructor(id: string, config: StatsConfig) {
        super(id, config);
        this.windowMS = calculateSeconds(config.granularity.duration) * 1000;
        this.maxRecords = (calculateSeconds(config.granularity.ttl) * 1000) / this.windowMS;
    }

    registerOccurrence(value: string){
        if (!this.timer) {
            this.newWindow();
        }
        this.registerOccurrenceOnWindow(value);        
    } 

    private newWindow() {
        this.createWindow();
        this.timer = setTimeout(()=>{
            this.onWindowClosed();
            this.timer = null;
        }, this.windowMS);
    }
    
    private createWindow() {
        this.ocurrences = new Map<string, number>();
    }

    private registerOccurrenceOnWindow(value: string) {
        if (!this.ocurrences.has(value)) {
            this.ocurrences.set(value, 0);
        }
        this.ocurrences.set(value, this.ocurrences.get(value)+1);
    }

    private onWindowClosed(){
        this.records.push(this.ocurrences);
        if (this.records.length > this.maxRecords) {
            this.records.shift();
        }
    }
}