"use strict";

import {Monitor} from "./monitor";
import {CpuMonitor} from "./monitor-cpu";
import {MemMonitor} from "./monitor-mem";
import {Gateway} from "../gateway";

export class Monitors {
    
    static startMonitors(gateway: Gateway){
        if (gateway.config.monitor) {
            if (gateway.logger.isInfoEnabled()) {
                gateway.logger.info(`Starting system monitors.`);
            }
            gateway.config.monitor.forEach(monitorConfig=>{
                if (monitorConfig.name === 'cpu') {
                    if (gateway.logger.isDebugEnabled()) {
                        gateway.logger.debug(`Starting a CPU monitor.`);
                    }                    
                    new CpuMonitor(gateway, monitorConfig).start();
                }
                else if (monitorConfig.name === 'mem') {
                    if (gateway.logger.isDebugEnabled()) {
                        gateway.logger.debug(`Starting a Memory monitor.`);
                    }                    
                    new MemMonitor(gateway, monitorConfig).start();
                }
            });
        }
    }
}