'use strict';

import { Monitor } from './monitor';
import { MonitorConfig } from '../config/gateway';
import { Stats } from '../stats/stats';

export class MemMonitor extends Monitor {
    private monitorInterval: NodeJS.Timer;
    private statsHeapTotal: Stats;
    private statsHeapUsed: Stats;
    private statsRss: Stats;
    private samples = 0;
    private totalHeap = 0;
    private totalUsed = 0;
    private totalRss = 0;

    constructor(config: MonitorConfig) {
        super(config);
        this.statsHeapTotal = this.createStats(`mem:heap-total`);
        this.statsHeapUsed = this.createStats(`mem:heap-used`);
        this.statsRss = this.createStats(`mem:rss`);
    }

    init() {
        this.monitorInterval = setInterval(() => {
            const memUsage = process.memoryUsage();
            this.samples++;
            this.totalHeap += memUsage.heapTotal;
            this.totalUsed += memUsage.heapUsed;
            this.totalRss += memUsage.rss;
        }, 1000);
        this.reset();
    }

    finish() {
        clearInterval(this.monitorInterval);
        this.reset();
    }

    run(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const heap = (this.samples > 0) ? this.totalHeap / this.samples : 0;
                const used = (this.samples > 0) ? this.totalUsed / this.samples : 0;
                const rss = (this.samples > 0) ? this.totalRss / this.samples : 0;
                this.reset();
                this.statsHeapTotal.registerMonitorOccurrence(this.machineId, heap);
                this.statsHeapUsed.registerMonitorOccurrence(this.machineId, used);
                this.statsRss.registerMonitorOccurrence(this.machineId, rss);
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }

    private reset() {
        this.totalHeap = 0;
        this.totalUsed = 0;
        this.totalRss = 0;
        this.samples = 0;
    }
}
