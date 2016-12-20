"use strict";

import {Stats} from "../stats/stats";
import {StatsRecorder} from "../stats/stats-recorder";
import {Gateway} from "../gateway";
import {MonitorConfig} from "../config/gateway";
import {calculateSeconds} from "../utils/time";
import * as os from "os";

export abstract class Monitor {
    private interval: NodeJS.Timer;
    private gateway: Gateway;
    private stats: Stats;
    private config: MonitorConfig;
    private machineId: string;
    private period: number;

    constructor(gateway: Gateway, config: MonitorConfig) {
        this.gateway = gateway;
        this.config = config;
        this.stats = this.createStats(this.config.name);
        this.machineId = `${os.hostname()}:${this.gateway.config.listenPort}`;
    }

    start() {
        this.period = calculateSeconds(this.config.statsConfig.granularity.duration) * 1000;
        let self = this;
        this.interval = setInterval(()=>{
            this.run(this.period).then(value=>self.registerStats(value)).catch(err=>{
                this.gateway.logger.error(`Error on monitor [${this.config.name}]: ${err}`);
                this.stop();
            });
        }, this.period);
    }

    stop() {
        if (this.interval) {
            if (this.gateway.logger.isDebugEnabled()) {
                this.gateway.logger.debug(`Stopping monitor [${this.config.name}]`);
            }
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    private registerStats(value: number) {
        this.stats.registerOccurrence(this.machineId, value);
    }

    private createStats(id: string) {
        let statsRecorder = new StatsRecorder(this.gateway);
        return statsRecorder.createStats(id, this.config.statsConfig);
    }

    abstract run(period: number): Promise<number>;
}