'use strict';

import { Monitor } from './monitor';
import { MonitorConfig } from '../config/gateway';
import { Stats } from '../stats/stats';

export class CpuMonitor extends Monitor {
    private statsProcess: Stats;
    private statsSystem: Stats;
    private startTime: [number,number];
    private startUsage: NodeJS.CpuUsage;

    constructor(config: MonitorConfig) {
        super(config);
        this.statsProcess = this.createStats(`cpu:process`);
        this.statsSystem = this.createStats(`cpu:system`);
    }

    init() {
        this.startTime  = process.hrtime();
        this.startUsage = process.cpuUsage();
    }

    run(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const elapTime = process.hrtime(this.startTime);
                const elapUsage = process.cpuUsage(this.startUsage);

                const elapTimeMS = this.secNSec2ms(elapTime);
                const elapUserMS = elapUsage.user / 1000;
                const elapSystMS = elapUsage.system / 1000;
                const userPercent = Math.round(1000 * elapUserMS / elapTimeMS)/10;
                const systemPercent = Math.round(1000 * elapSystMS / elapTimeMS)/10;
                this.statsSystem.registerMonitorOccurrence(this.machineId, systemPercent);
                this.statsProcess.registerMonitorOccurrence(this.machineId, userPercent);
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }

    secNSec2ms (secNSec: [number,number]) {
        return secNSec[0] * 1000 + secNSec[1] / 1000000;
    }
}
