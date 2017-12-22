'use strict';

import { Monitor } from './monitor';
import { MonitorConfig } from '../config/gateway';
import { Stats } from '../stats/stats';

export class EventLoopMonitor extends Monitor {
    private monitor: any;
    private statsLatency: Stats;
    private samples = 0;
    private totalLatency = 0;

    constructor(config: MonitorConfig) {
        super(config);
        this.statsLatency = this.createStats(`eventloop:latency`);
    }

    init() {
        const eventLoopMonitor = require('eventloop-latency');
        const interval = 1000;
        const hrInterval = 10;
        this.monitor = new eventLoopMonitor(interval, hrInterval);
        this.monitor.on('data', (eventloop: Array<number>) => {
            this.samples++;
            const average = (eventloop && eventloop.length) ? eventloop.reduce((total, val) => total + val) / eventloop.length : 0;
            this.totalLatency += average > 0 ? average / 1000 : 0;
        });
        this.monitor.start(true);
        this.reset();
    }

    finish() {
        this.monitor.stop();
        this.reset();
    }

    run(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const latency = (this.samples > 0) ? this.totalLatency / this.samples : 0;
                this.reset();
                this.statsLatency.registerMonitorOccurrence(this.machineId, latency);
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }

    private reset() {
        this.totalLatency = 0;
        this.samples = 0;
    }
}
