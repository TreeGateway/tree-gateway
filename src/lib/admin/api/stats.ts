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
    @Path(":api")
    getstats(@PathParam("api")api: string, @QueryParam('path')path: string) : Promise<Array<Array<number>>>{
        return new Promise<Array<Array<number>>>((resolve, reject) =>{
            let found: boolean = false;
            AdminServer.gateway.apis.forEach((apiConfig)=>{
                if (!found && api === apiConfig.name) {
                    if (path) {
                        found = true;
                        let stats = AdminServer.gateway.createStats(Stats.getStatsKey('auth', apiConfig.proxy.path, 'fail'))
                        return stats.getLastOccurrences(24, path).then(resolve).catch(reject);
                    }
                }
            });
            if (!found) {
                reject(new Errors.NotFoundError("API not found"));
            }
        });
    }
}
