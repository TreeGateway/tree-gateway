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
    private config: MonitorConfig;
    private period: number;
    protected machineId: string;

    constructor(config: MonitorConfig) {
        this.config = config;
        this.machineId = Monitor.getMachineId();
    }

    start() {
        const monitorName = this.config.id || this.config.name;
        this.init();
        this.period = getMilisecondsInterval(this.config.statsConfig.granularity.duration);
        this.interval = setInterval(() => {
            this.run().then(() => {
                if (this.logger.isDebugEnabled()) {
                    this.logger.debug(`Monitor [${monitorName}] executed`);
                }
            }).catch(err => {
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
        this.finish();
    }

    protected createStats(id: string): Stats {
        return this.statsRecorder.createStats(id, this.config.statsConfig);
    }

    abstract run(): Promise<void>;

    abstract init(): void;
    abstract finish(): void;

    static getMachineId() {
        return (process.env.processNumber ? `${os.hostname()}:${process.env.processNumber}` : `${os.hostname()}`);
    }
}
