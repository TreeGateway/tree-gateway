"use strict";

import {Monitor} from "./monitor";
import {Gateway} from "../gateway";
import {MonitorConfig} from "../config/gateway";
import * as os from "os";

export class MemMonitor extends Monitor {
    constructor(gateway: Gateway, config: MonitorConfig) {
        super(gateway, config);
    }

    run(period: number): Promise<number> {
        return new Promise<number>((resolve, reject)=>{
            let memUsage = os.totalmem() - os.freemem();
            resolve(memUsage);
        });
    }
}