"use strict";

import {Monitor} from "./monitor";
import {CpuMonitor} from "./monitor-cpu";
import {MemMonitor} from "./monitor-mem";
import {Gateway} from "../gateway";
import * as _ from "lodash";

export class Monitors {
    static MONITORS_PREFIX: string = "monitors"
    static activeMonitors: Array<Monitor> = new Array<Monitor>();

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
                    resolve(_.keys(monitors));
                })
                .catch(reject);
        });
        
    }

    private static registerMonitor(gateway: Gateway) {
        gateway.redisClient.hmset(`${Monitors.MONITORS_PREFIX}`, Monitor.getMachineId(), Date.now());
    }
    private static unregisterMonitor(gateway: Gateway) {
        gateway.redisClient.hdel(`${Monitors.MONITORS_PREFIX}`, Monitor.getMachineId());
    }
    
}