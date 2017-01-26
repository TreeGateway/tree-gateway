"use strict";

import {Monitor} from "./monitor";
import {CpuMonitor} from "./monitor-cpu";
import {MemMonitor} from "./monitor-mem";
import {Gateway} from "../gateway";
import * as _ from "lodash";

export class Monitors {
    static MONITORS_PREFIX: string = "monitors"
    static activeMonitors: Array<Monitor> = new Array<Monitor>();
    private static interval: NodeJS.Timer;

    static startMonitors(gateway: Gateway){
        if (gateway.config.monitor) {
            if (gateway.logger.isInfoEnabled()) {
                gateway.logger.info(`Starting system monitors.`);
            }
            gateway.config.monitor.forEach(monitorConfig=>{
                let monitor = null;
                if (monitorConfig.name === 'cpu') {
                    if (gateway.logger.isDebugEnabled()) {
                        gateway.logger.debug(`Starting a CPU monitor.`);
                    }                    
                    monitor = new CpuMonitor(gateway, monitorConfig);
                }
                else if (monitorConfig.name === 'mem') {
                    if (gateway.logger.isDebugEnabled()) {
                        gateway.logger.debug(`Starting a Memory monitor.`);
                    }                    
                    monitor = new MemMonitor(gateway, monitorConfig);
                }
                if (monitor) {
                    monitor.start();
                    Monitors.activeMonitors.push(monitor);
                }
            });
            Monitors.registerMonitor(gateway);
        }
    }

    static stopMonitors(gateway: Gateway){
        if (gateway.config.monitor) {
            Monitors.activeMonitors.forEach(monitor => monitor.stop());
            Monitors.activeMonitors = [];
            Monitors.unregisterMonitor(gateway);
        }
    }

    static getActiveMachines(gateway: Gateway): Promise<Array<string>> {
        return new Promise<Array<string>>((resolve, reject) => {
            gateway.redisClient.hgetall(Monitors.MONITORS_PREFIX)
                .then((monitors) => {
                    let result: Array<string> = [];
                    let now = Date.now();
                    _.keys(monitors).forEach(machine => {
                        if (now-monitors[machine] < 10001) {
                            result.push(machine);
                        }
                        else {
                            gateway.redisClient.hdel(`${Monitors.MONITORS_PREFIX}`, machine);
                        }
                    });
                    resolve(result);
                })
                .catch(reject);
        });        
    }

    private static registerMonitor(gateway: Gateway) {
        let period = 10000;
        Monitors.interval = setInterval(()=>{
            gateway.redisClient.hmset(`${Monitors.MONITORS_PREFIX}`, Monitor.getMachineId(), Date.now());
        }, period);
    }

    private static unregisterMonitor(gateway: Gateway) {
        if (Monitors.interval) {
            clearInterval(Monitors.interval);
            Monitors.interval = null;
        }
        gateway.redisClient.hdel(`${Monitors.MONITORS_PREFIX}`, Monitor.getMachineId());
    }
    
}