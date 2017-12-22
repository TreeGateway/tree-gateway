'use strict';

import { Monitor } from './monitor';
import { MonitorConfig } from '../config/gateway';
import { Stats } from '../stats/stats';

const gcMonitor = require('gc-stats');

export class GcMonitor extends Monitor {
    private metricListener: (data: any) => void;
    private monitor: any;
    private statsSize: Stats;
    private statsUsed: Stats;
    private statsDuration: Stats;
    private samples = 0;
    private totalSize = 0;
    private totalUsed = 0;
    private totalDuration = 0;

    constructor(config: MonitorConfig) {
        super(config);
        this.statsSize = this.createStats(`gc:size`);
        this.statsUsed = this.createStats(`gc:used`);
        this.statsDuration = this.createStats(`gc:duration`);
    }

    init() {
        this.monitor = gcMonitor();
        this.metricListener = (gc: any) => {
            this.samples++;
            this.totalSize += gc.diff.totalHeapSize;
            this.totalUsed += (-1*gc.diff.usedHeapSize);
            this.totalDuration += gc.pauseMS;
        };
        this.reset();
        this.monitor.on('stats', this.metricListener);
    }

    finish() {
        this.monitor.removeListener('stats', this.metricListener);
        this.reset();
    }

    run(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const size = (this.samples > 0) ? this.totalSize / this.samples : 0;
                const used = (this.samples > 0) ? this.totalUsed / this.samples : 0;
                const duration = (this.samples > 0) ? this.totalDuration / this.samples : 0;
                this.reset();
                this.statsSize.registerMonitorOccurrence(this.machineId, size);
                this.statsUsed.registerMonitorOccurrence(this.machineId, used);
                this.statsDuration.registerMonitorOccurrence(this.machineId, duration);
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }

    private reset() {
        this.totalSize = 0;
        this.totalUsed = 0;
        this.totalDuration = 0;
        this.samples = 0;
    }
}
