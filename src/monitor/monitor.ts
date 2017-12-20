'use strict';

import { Stats } from '../stats/stats';
import { MonitorConfig } from '../config/gateway';
import * as os from 'os';
import { Logger } from '../logger';
import { AutoWired, Inject } from 'typescript-ioc';
import { StatsRecorder } from '../stats/stats-recorder';
import { getMilisecondsInterval } from '../utils/time-intervals';

@AutoWired
export abstract class Monitor {
    @Inject private logger: Logger;
    @Inject private statsRecorder: StatsRecorder;
    private interval: NodeJS.Timer;
    private stats: Stats;
    private config: MonitorConfig;
    private machineId: string;
    private period: number;

    constructor(config: MonitorConfig) {
        this.config = config;
        this.stats = this.createStats(this.config.id || this.config.name);
        this.machineId = Monitor.getMachineId();
    }

    start() {
        this.period = getMilisecondsInterval(this.config.statsConfig.granularity.duration);
        const self = this;
        this.interval = setInterval(() => {
            this.run(this.period).then(value => self.registerStats(value)).catch(err => {
                const monitorName = this.config.id || this.config.name;
                this.logger.error(`Error on monitor [${monitorName}]: ${err}`);
                this.stop();
            });
        }, this.period);
    }

    stop() {
        if (this.interval) {
            if (this.logger.isDebugEnabled()) {
                const monitorName = this.config.id || this.config.name;
                this.logger.debug(`Stopping monitor [${monitorName}]`);
            }
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    private registerStats(value: number) {
        this.stats.registerMonitorOccurrence(this.machineId, value);
    }

    private createStats(id: string) {
        return this.statsRecorder.createStats(id, this.config.statsConfig);
    }

    abstract run(period: number): Promise<number>;

    static getMachineId() {
        return (process.env.processNumber ? `${os.hostname()}:${process.env.processNumber}` : `${os.hostname()}`);
    }
}
