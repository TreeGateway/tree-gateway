'use strict';

import { Monitor } from './monitor';
import { MonitorConfig } from '../config/gateway';
import * as os from 'os';

export class CpuMonitor extends Monitor {
    private startMeasure = this.cpuAverage();
    constructor(config: MonitorConfig) {
        super(config);
    }

    run(period: number): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            // Grab second Measure
            const endMeasure = this.cpuAverage();

            // Calculate the difference in idle and total time between the measures
            const idleDifference = endMeasure.idle - this.startMeasure.idle;
            const totalDifference = endMeasure.total - this.startMeasure.total;

            // Calculate the average percentage CPU usage
            const percentageCPU = 100 - ~~(100 * idleDifference / totalDifference);

            this.startMeasure = endMeasure;
            resolve(percentageCPU);
        });
    }

    private cpuAverage() {
        // Initialise sum of idle and time of cores and fetch CPU info
        let totalIdle = 0, totalTick = 0;
        const cpus = os.cpus();

        for (let i = 0, len = cpus.length; i < len; i++) {
            const cpu: any = cpus[i];

            // Total up the time in the cores tick
            for (const type in cpu.times) {
                totalTick += cpu.times[type];
            }

            totalIdle += cpu.times.idle;
        }

        // Return the average Idle and Tick times
        return { idle: totalIdle / cpus.length, total: totalTick / cpus.length };
    }
}
