"use strict";

import {Monitor} from "./monitor";
import {CpuMonitor} from "./monitor-cpu";
import {MemMonitor} from "./monitor-mem";
import {Gateway} from "../gateway";

export class Monitors {
    
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
        }
    }

    static stopMonitors(){
        Monitors.activeMonitors.forEach(monitor => monitor.stop());
        Monitors.activeMonitors = [];
    }
}