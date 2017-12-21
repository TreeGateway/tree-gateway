'use strict';

import { Monitor } from './monitor';
import { MonitorConfig } from '../config/gateway';
import { Metrics } from '../metrics';
import { Stats } from '../stats/stats';

export class EventLoopMonitor extends Monitor {
    private metricListener: (data: any) => void;
    private statsLatency: Stats;
    private samples = 0;
    private totalLatency = 0;

    constructor(config: MonitorConfig) {
        super(config);
        this.statsLatency = this.createStats(`eventloop:latency`);
    }

    init() {
        this.metricListener = (eventloop: any) => {
            this.samples++;
            this.totalLatency += eventloop.latency.avg;
        };
        this.reset();
        Metrics.on('eventloop', this.metricListener);
    }

    finish() {
        Metrics.removeListener('eventloop', this.metricListener);
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
