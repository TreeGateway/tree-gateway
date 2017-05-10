'use strict';

import { Monitor } from './monitor';
import { MonitorConfig } from '../config/gateway';
import * as os from 'os';

export class MemMonitor extends Monitor {
    constructor(config: MonitorConfig) {
        super(config);
    }

    run(period: number): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            const memUsage = os.totalmem() - os.freemem();
            resolve(memUsage);
        });
    }
}
