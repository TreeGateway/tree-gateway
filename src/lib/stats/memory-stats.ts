"use strict";

import {StatsConfig} from "../config/stats";
import {StatsHandler} from "./stats";

export class MemoryStats extends StatsHandler {
    records: Array<Map<string, number>> = new Array<Map<string, number>>();
    ocurrences: Map<string, number>;
    
    constructor(id: string, config: StatsConfig) {
        super(id, config);
    }

    createWindow() {
        this.ocurrences = new Map<string, number>();
    }

    registerOccurenceOnWindow(value: string) {
        if (!this.ocurrences.has(value)) {
            this.ocurrences.set(value, 0);
        }
        this.ocurrences.set(value, this.ocurrences.get(value)+1);
    }

    onWindowClosed(){
        this.records.push(this.ocurrences);
        if (this.records.length > this.getMeasurements()) {
            this.records.shift();
        }
    }
}