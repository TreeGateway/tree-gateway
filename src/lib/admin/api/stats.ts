"use strict";

import {Path, GET, POST, DELETE, PUT, PathParam, FileParam, FormParam, Errors, Return,
        Accept, QueryParam} from "typescript-rest";
import "es6-promise";
import {ApiConfig, validateApiConfig} from "../../config/api";
import {Stats} from "../../stats/stats";
import {Monitors} from "../../monitor/monitors";
import {AutoWired, Inject} from "typescript-ioc";
import {Gateway} from "../../gateway";
import {StatsRecorder} from "../../stats/stats-recorder";

@Path('stats')
@AutoWired
export class StatsRest {
    @Inject private monitors: Monitors;
    @Inject private gateway: Gateway;
    @Inject private statsRecorder: StatsRecorder;

    @GET
    @Path("auth/fail/:apiId")
    getAuthFail(@PathParam("apiId") apiId: string, 
                @QueryParam('path') path: string, 
                @QueryParam('count') count: number) : Promise<Array<Array<number>>>{
        return this.getStats(apiId, 'auth', path, 'fail', count);
    }

    @GET
    @Path("auth/success/:apiId")
    getAuthSuccess(@PathParam("apiId") apiId: string, 
                @QueryParam('path') path: string, 
                @QueryParam('count') count: number) : Promise<Array<Array<number>>>{
        return this.getStats(apiId, 'auth', path, 'success', count);
    }

    @GET
    @Path("cache/hit/:apiId")
    getCahcheHit(@PathParam("apiId") apiId: string, 
                @QueryParam('path') path: string, 
                @QueryParam('count') count: number) : Promise<Array<Array<number>>>{
        return this.getStats(apiId, 'cache', path, 'hit', count);
    }

    @GET
    @Path("cache/miss/:apiId")
    getCahcheMiss(@PathParam("apiId") apiId: string, 
                @QueryParam('path') path: string, 
                @QueryParam('count') count: number) : Promise<Array<Array<number>>>{
        return this.getStats(apiId, 'cache', path, 'miss', count);
    }

    @GET
    @Path("cache/error/:apiId")
    getCahcheError(@PathParam("apiId") apiId: string, 
                @QueryParam('path') path: string, 
                @QueryParam('count') count: number) : Promise<Array<Array<number>>>{
        return this.getStats(apiId, 'cache', path, 'error', count);
    }

    @GET
    @Path("throttling/exceeded/:apiId")
    getThrottlingExceeded(@PathParam("apiId") apiId: string, 
                @QueryParam('path') path: string, 
                @QueryParam('count') count: number) : Promise<Array<Array<number>>>{
        return this.getStats(apiId, 'throttling', path, 'exceeded', count);
    }

    @GET
    @Path("circuitbreaker/open/:apiId")
    getCircuitBreakerOpen(@PathParam("apiId") apiId: string, 
                @QueryParam('count') count: number) : Promise<Array<Array<number>>>{
        return this.getStats(apiId, 'circuitbreaker', 'total', 'open', count);
    }

    @GET
    @Path("circuitbreaker/close/:apiId")
    getCircuitBreakerClose(@PathParam("apiId") apiId: string, 
                @QueryParam('count') count: number) : Promise<Array<Array<number>>>{
        return this.getStats(apiId, 'circuitbreaker', 'total', 'close', count);
    }

    @GET
    @Path("circuitbreaker/rejected/:apiId")
    getCircuitBreaker(@PathParam("apiId") apiId: string, 
                @QueryParam('count') count: number) : Promise<Array<Array<number>>>{
        return this.getStats(apiId, 'circuitbreaker', 'total', 'rejected', count);
    }

    @GET
    @Path("access/request/:apiId")
    getAccessRequest(@PathParam("apiId") apiId: string, 
                @QueryParam('path')path: string, 
                @QueryParam('count')count: number) : Promise<Array<Array<number>>>{
        return this.getStats(apiId, 'access', path, 'request', count);
    }
    
    @GET
    @Path("access/status/:code/:apiId")
    getAccessStatus(@PathParam("apiId") apiId: string,
                @PathParam("code") code: number, 
                @QueryParam('path') path: string, 
                @QueryParam('count') count: number) : Promise<Array<Array<number>>>{
        return this.getStats(apiId, 'access', path, 'request', count||24, `${code}`);
    }

    @GET
    @Path("monitors/machines")
    getMachines() : Promise<Array<string>>{
        return this.monitors.getActiveMachines();
    }

    @GET
    @Path("monitors/cpu/:machineId")
    getCpuMonitor(@PathParam("machineId") machineId: string, 
                @QueryParam('count') count: number) : Promise<Array<Array<number>>>{
        return this.getMonitorStats("cpu", machineId, count);
    }

    @GET
    @Path("monitors/mem/:machineId")
    getMemMonitor(@PathParam("machineId") machineId: string, 
                @QueryParam('count') count: number) : Promise<Array<Array<number>>>{
        return this.getMonitorStats("mem", machineId, count);
    }

    protected getStats(apiId: string, 
                prefix: string,                 
                path: string,
                key: string,                 
                count?: number,
                ...extra: string[]) : Promise<Array<Array<number>>>{
        return new Promise<Array<Array<number>>>((resolve, reject) =>{
            let apiConfig = this.gateway.getApiConfig(apiId);
            
            if (!apiConfig) {
                return reject(new Errors.NotFoundError("API not found"));
            }
            if (path) {
                let stats = this.statsRecorder.createStats(Stats.getStatsKey(prefix, apiConfig.path, key))
                stats.getLastOccurrences(count||24, path, ...extra)
                .then(resolve)
                .catch(reject);
            }
            else {
                return reject(new Errors.ForbidenError("Path parameter is required."));
            }
        });
    }

    protected getMonitorStats(
                name: string,
                machineId: string,
                count?: number) : Promise<Array<Array<number>>>{
        return new Promise<Array<Array<number>>>((resolve, reject) =>{
            let stats = this.statsRecorder.createStats(name)
            stats.getLastOccurrences(count||24, machineId)
            .then(resolve)
            .catch(reject);
        });
    }
}
