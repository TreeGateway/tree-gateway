'use strict';

import { Monitor } from './monitor';
import { MonitorConfig } from '../config/gateway';
import { Metrics } from '../metrics';
import { Stats } from '../stats/stats';

export class MemMonitor extends Monitor {
    private metricListener: (data: any) => void;
    private statsProcess: Stats;
    private statsFree: Stats;
    private statsVirtual: Stats;
    private samples = 0;
    private totalApp = 0;
    private totalFree = 0;
    private totalVirtual = 0;

    constructor(config: MonitorConfig) {
        super(config);
        this.statsProcess = this.createStats(`mem:process`);
        this.statsFree = this.createStats(`mem:free`);
        this.statsVirtual = this.createStats(`mem:virtual`);
    }

    init() {
        this.metricListener = (mem: any) => {
            this.samples++;
            this.totalApp += mem.physical;
            this.totalFree += mem.physical_free;
            this.totalVirtual += mem.virtual;
        };
        this.reset();
        Metrics.on('memory', this.metricListener);
    }

    finish() {
        Metrics.removeListener('memory', this.metricListener);
        this.reset();
    }

    run(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const appMem = (this.samples > 0) ? this.totalApp / this.samples : 0;
                const free = (this.samples > 0) ? this.totalFree / this.samples : 0;
                const appVirtual = (this.samples > 0) ? this.totalVirtual / this.samples : 0;
                this.reset();
                this.statsProcess.registerMonitorOccurrence(this.machineId, appMem);
                this.statsFree.registerMonitorOccurrence(this.machineId, free);
                this.statsVirtual.registerMonitorOccurrence(this.machineId, appVirtual);
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }

    private reset() {
        this.totalApp = 0;
        this.totalFree = 0;
        this.totalVirtual = 0;
        this.samples = 0;
    }
}
