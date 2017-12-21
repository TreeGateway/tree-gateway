'use strict';

import { Monitor } from './monitor';
import { MonitorConfig } from '../config/gateway';
import { Metrics } from '../metrics';
import { Stats } from '../stats/stats';

export class CpuMonitor extends Monitor {
    private metricListener: (data: any) => void;
    private statsProcess: Stats;
    private statsSystem: Stats;
    private samples = 0;
    private totalSystem = 0;
    private totalProcess = 0;

    constructor(config: MonitorConfig) {
        super(config);
        this.statsProcess = this.createStats(`cpu:process`);
        this.statsSystem = this.createStats(`cpu:system`);
    }

    init() {
        this.metricListener = (cpu: any) => {
            this.samples++;
            this.totalSystem += cpu.system;
            this.totalProcess += cpu.process;
        };
        this.reset();
        Metrics.on('cpu', this.metricListener);
    }

    finish() {
        Metrics.removeListener('cpu', this.metricListener);
        this.reset();
    }

    run(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const system = (this.samples > 0) ? this.totalSystem / this.samples : 0;
                const process = (this.samples > 0) ? this.totalProcess / this.samples : 0;
                this.reset();
                this.statsSystem.registerMonitorOccurrence(this.machineId, system);
                this.statsProcess.registerMonitorOccurrence(this.machineId, process);
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }

    private reset() {
        this.totalSystem = 0;
        this.totalProcess = 0;
        this.samples = 0;
    }
}
