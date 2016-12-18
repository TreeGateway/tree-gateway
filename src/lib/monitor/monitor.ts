"use strict";

import {Stats} from "../stats/stats";
import {StatsRecorder} from "../stats/stats-recorder";
import {Gateway} from "../gateway";
import {MonitorConfig} from "../config/gateway";
import {calculateSeconds} from "../utils/time";

export abstract class Monitor {
    private interval: NodeJS.Timer;
    private gateway: Gateway;
    private stats: Stats;
    private config: MonitorConfig;

    constructor(gateway: Gateway, config: MonitorConfig) {
        this.gateway = gateway;
        this.config = config;
        this.stats = this.gateway.createStats(this.config.name);
    }


    createStats(id: string) {
        let statsRecorder = new StatsRecorder(this.gateway);
        return statsRecorder.createStats(id, this.config.statsConfig);
    }

    start() {
        let time: number = calculateSeconds(this.config.statsConfig.granularity.duration) * 1000;
        this.interval = setInterval(()=>{
            this.run().then(this.registerStats).catch(err=>{
                this.gateway.logger.error(`Error on monitor [${this.config.name}]: ${err}`);
                this.stop();
            });
        }, time);
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

    registerStats(value: number) {
        this.stats.registerOccurrence('value', value);
    }

    abstract run(): Promise<number>;
}