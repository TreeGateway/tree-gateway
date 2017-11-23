'use strict';

import { Monitor } from './monitor';
import { CpuMonitor } from './monitor-cpu';
import { MemMonitor } from './monitor-mem';
import * as _ from 'lodash';
import { Logger } from '../logger';
import { AutoWired, Singleton, Inject } from 'typescript-ioc';
import { Configuration } from '../configuration';
import { Database } from '../database';

@AutoWired
@Singleton
export class Monitors {
    private static MACHINES_PREFIX: string = 'machines';

    @Inject
    private config: Configuration;
    @Inject
    private logger: Logger;
    @Inject
    private database: Database;

    private activeMonitors: Array<Monitor> = new Array<Monitor>();
    private interval: NodeJS.Timer;

    startMonitors() {
        if (this.config.gateway.monitor) {
            if (this.logger.isInfoEnabled()) {
                this.logger.info(`Starting system monitors.`);
            }
            this.config.gateway.monitor.forEach(monitorConfig => {
                let monitor = null;
                const monitorName = monitorConfig.id || monitorConfig.name;
                if (monitorName === 'cpu') {
                    if (this.logger.isDebugEnabled()) {
                        this.logger.debug(`Starting a CPU monitor.`);
                    }
                    monitor = new CpuMonitor(monitorConfig);
                } else if (monitorName === 'mem') {
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
        }
        this.registerMachine();
    }

    stopMonitors() {
        if (this.config.gateway.monitor) {
            this.activeMonitors.forEach(monitor => monitor.stop());
            this.activeMonitors = [];
        }
        this.unregisterMachine();
    }

    getActiveMachines(): Promise<Array<string>> {
        return new Promise<Array<string>>((resolve, reject) => {
            this.database.redisClient.hgetall(Monitors.MACHINES_PREFIX)
                .then((monitors: any) => {
                    const result: Array<string> = [];
                    const now = Date.now();
                    _.keys(monitors).forEach(machine => {
                        if (now - monitors[machine] < 10001) {
                            result.push(machine);
                        } else {
                            this.database.redisClient.hdel(`${Monitors.MACHINES_PREFIX}`, machine);
                        }
                    });
                    resolve(result);
                })
                .catch(reject);
        });
    }

    private registerMachine() {
        const period = 10000;
        this.interval = setInterval(() => {
            this.database.redisClient.hmset(`${Monitors.MACHINES_PREFIX}`, Monitor.getMachineId(), Date.now());
        }, period);
    }

    private unregisterMachine() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.database.redisClient.hdel(`${Monitors.MACHINES_PREFIX}`, Monitor.getMachineId());
    }
}
