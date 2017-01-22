"use strict";

import {Path, GET, POST, DELETE, PUT, PathParam, FileParam, FormParam, Errors, Return,
        Accept, QueryParam} from "typescript-rest";
import "es6-promise";
import {ApiConfig, validateApiConfig} from "../../config/api";
import {AdminServer} from "../admin-server";
import {Stats} from "../../stats/stats";

@Path('stats')
export class StatsService {
    @GET
    @Path("auth/fail/:apiName/:apiVersion")
    getAuthFail(@PathParam("apiName")apiName: string, 
                @PathParam("apiVersion")apiVersion: string, 
                @QueryParam('path')path: string, 
                @QueryParam('count')count: number) : Promise<Array<Array<number>>>{
        return this.getStats(apiName, apiVersion, 'auth', path, 'fail', count);
    }

    @GET
    @Path("auth/success/:apiName/:apiVersion")
    getAuthSuccess(@PathParam("apiName")apiName: string, 
                @PathParam("apiVersion")apiVersion: string, 
                @QueryParam('path')path: string, 
                @QueryParam('count')count: number) : Promise<Array<Array<number>>>{
        return this.getStats(apiName, apiVersion, 'auth', path, 'success', count);
    }

    @GET
    @Path("cache/hit/:apiName/:apiVersion")
    getCahcheHit(@PathParam("apiName")apiName: string, 
                @PathParam("apiVersion")apiVersion: string, 
                @QueryParam('path')path: string, 
                @QueryParam('count')count: number) : Promise<Array<Array<number>>>{
        return this.getStats(apiName, apiVersion, 'cache', path, 'hit', count);
    }

    @GET
    @Path("cache/miss/:apiName/:apiVersion")
    getCahcheMiss(@PathParam("apiName")apiName: string, 
                @PathParam("apiVersion")apiVersion: string, 
                @QueryParam('path')path: string, 
                @QueryParam('count')count: number) : Promise<Array<Array<number>>>{
        return this.getStats(apiName, apiVersion, 'cache', path, 'miss', count);
    }

    @GET
    @Path("cache/error/:apiName/:apiVersion")
    getCahcheError(@PathParam("apiName")apiName: string, 
                @PathParam("apiVersion")apiVersion: string, 
                @QueryParam('path')path: string, 
                @QueryParam('count')count: number) : Promise<Array<Array<number>>>{
        return this.getStats(apiName, apiVersion, 'cache', path, 'error', count);
    }

    @GET
    @Path("throttling/exceeded/:apiName/:apiVersion")
    getThrottlingExceeded(@PathParam("apiName")apiName: string, 
                @PathParam("apiVersion")apiVersion: string, 
                @QueryParam('path')path: string, 
                @QueryParam('count')count: number) : Promise<Array<Array<number>>>{
        return this.getStats(apiName, apiVersion, 'throttling', path, 'exceeded', count);
    }

    @GET
    @Path("access/request/:apiName/:apiVersion")
    getAccessRequest(@PathParam("apiName")apiName: string, 
                @PathParam("apiVersion")apiVersion: string, 
                @QueryParam('path')path: string, 
                @QueryParam('count')count: number) : Promise<Array<Array<number>>>{
        return this.getStats(apiName, apiVersion, 'access', path, 'request', count);
    }
    
    @GET
    @Path("access/status/:code/:apiName/:apiVersion")
    getAccessStatus(@PathParam("apiName")apiName: string, 
                @PathParam("apiVersion")apiVersion: string, 
                @QueryParam('path')path: string, 
                @QueryParam('count')count: number) : Promise<Array<Array<number>>>{
        return this.getStats(apiName, apiVersion, 'access', path, 'request', count);
    }

    protected getStats(apiName: string, 
                apiVersion: string,
                prefix: string,                 
                path: string,
                key: string, 
                count?: number) : Promise<Array<Array<number>>>{
        return new Promise<Array<Array<number>>>((resolve, reject) =>{
            let apiConfig = AdminServer.gateway.getApiConfig(apiName, apiVersion);
            
            if (!apiConfig) {
                return reject(new Errors.NotFoundError("API not found"));
            }
            if (path) {
                let stats = AdminServer.gateway.createStats(Stats.getStatsKey(prefix, apiConfig.proxy.path, key))
                stats.getLastOccurrences(count||24, path)
                .then(resolve)
                .catch(reject);
            }
            else {
                return reject(new Errors.ForbidenError("Path parameter is required."));
            }
        });
    }
}
