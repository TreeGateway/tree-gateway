"use strict";

import {Monitor} from "./monitor";
import {CpuMonitor} from "./monitor-cpu";
import {MemMonitor} from "./monitor-mem";
import {Gateway} from "../gateway";
import * as _ from "lodash";
import {Logger} from "../logger";
import {AutoWired, Singleton, Inject} from "typescript-ioc";
import {Configuration} from "../configuration";
import {Database} from "../database";

@AutoWired
@Singleton
export class Monitors {
    private static MONITORS_PREFIX: string = "monitors";

    @Inject
    private config: Configuration;
    @Inject
    private logger: Logger;
    @Inject
    private database: Database;

    private activeMonitors: Array<Monitor> = new Array<Monitor>();
    private interval: NodeJS.Timer;

    startMonitors(){
        if (this.config.gateway.monitor) {
            if (this.logger.isInfoEnabled()) {
                this.logger.info(`Starting system monitors.`);
            }
            this.config.gateway.monitor.forEach(monitorConfig=>{
                let monitor = null;
                if (monitorConfig.name === 'cpu') {
                    if (this.logger.isDebugEnabled()) {
                        this.logger.debug(`Starting a CPU monitor.`);
                    }                    
                    monitor = new CpuMonitor(monitorConfig);
                }
                else if (monitorConfig.name === 'mem') {
                    if (this.logger.isDebugEnabled()) {
                        this.logger.debug(`Starting a Memory monitor.`);
                    }                    
                    monitor = new MemMonitor(monitorConfig);
                }
                if (monitor) {
                    monitor.start();
                    this.activeMonitors.push(monitor);
                }
            });
            this.registerMonitor();
        }
    }

    stopMonitors(){
        if (this.config.gateway.monitor) {
            this.activeMonitors.forEach(monitor => monitor.stop());
            this.activeMonitors = [];
            this.unregisterMonitor();
        }
    }

    getActiveMachines(): Promise<Array<string>> {
        return new Promise<Array<string>>((resolve, reject) => {
            this.database.redisClient.hgetall(Monitors.MONITORS_PREFIX)
                .then((monitors) => {
                    let result: Array<string> = [];
                    let now = Date.now();
                    _.keys(monitors).forEach(machine => {
                        if (now-monitors[machine] < 10001) {
                            result.push(machine);
                        }
                        else {
                            this.database.redisClient.hdel(`${Monitors.MONITORS_PREFIX}`, machine);
                        }
                    });
                    resolve(result);
                })
                .catch(reject);
        });        
    }

    private registerMonitor() {
        let self = this;
        let period = 10000;
        self.interval = setInterval(()=>{
            this.database.redisClient.hmset(`${Monitors.MONITORS_PREFIX}`, Monitor.getMachineId(), Date.now());
        }, period);
    }

    private unregisterMonitor() {
        let self = this;
        if (self.interval) {
            clearInterval(self.interval);
            self.interval = null;
        }
        this.database.redisClient.hdel(`${Monitors.MONITORS_PREFIX}`, Monitor.getMachineId());
    }
    
}