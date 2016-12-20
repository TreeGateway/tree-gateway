"use strict";

import {Monitor} from "./monitor";
import {Gateway} from "../gateway";
import {MonitorConfig} from "../config/gateway";
import * as os from "os";

const ONE_MINUTE = 60*1000;
const FIVE_MINUTES = 5*ONE_MINUTE;
const FIFTEEN_MINUTES = 15*ONE_MINUTE;

export class CpuMonitor extends Monitor {
    private startMeasure = this.cpuAverage();
    constructor(gateway: Gateway, config: MonitorConfig) {
        super(gateway, config);
    }

    run(period: number): Promise<number> {
        return new Promise<number>((resolve, reject)=>{
            //Grab second Measure
            var endMeasure = this.cpuAverage(); 

            //Calculate the difference in idle and total time between the measures
            var idleDifference = endMeasure.idle - this.startMeasure.idle;
            var totalDifference = endMeasure.total - this.startMeasure.total;

            //Calculate the average percentage CPU usage
            var percentageCPU = 100 - ~~(100 * idleDifference / totalDifference);

            this.startMeasure = endMeasure;
            resolve(percentageCPU);
        });
    }

    private cpuAverage() {
        //Initialise sum of idle and time of cores and fetch CPU info
        let totalIdle = 0, totalTick = 0;
        let cpus = os.cpus();

        for(var i = 0, len = cpus.length; i < len; i++) {
            var cpu = cpus[i];

            //Total up the time in the cores tick
            for(let type in cpu.times) {
                totalTick += cpu.times[type];
            }     

            totalIdle += cpu.times.idle;
        }

        //Return the average Idle and Tick times
        return {idle: totalIdle / cpus.length,  total: totalTick / cpus.length};
    }
}