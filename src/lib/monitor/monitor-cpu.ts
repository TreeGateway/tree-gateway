"use strict";

import {Monitor} from "./monitor";
import {Gateway} from "../gateway";
import {MonitorConfig} from "../config/gateway";

export class CpuMonitor extends Monitor {
    constructor(gateway: Gateway, config: MonitorConfig) {
        super(gateway, config);
    }

    run(): Promise<number> {
        return new Promise<number>((resolve, reject)=>{

        });
    }
}