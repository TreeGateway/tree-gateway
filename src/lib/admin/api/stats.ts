"use strict";

import {Path, GET, POST, DELETE, PUT, PathParam, FileParam, FormParam, Errors, Return,
        Accept, QueryParam} from "typescript-rest";
import "es6-promise";
import {ApiConfig, validateApiConfig} from "../../config/api";
import {AdminServer} from "../admin-server";
import * as Utils from "underscore";
import {Stats} from "../../stats/stats";

@Path('stats')
export class StatsService {
    @GET
    @Path(":api")
    getstats(@PathParam("api")api: string, @QueryParam('path')path: string) : Promise<Array<Array<number>>>{
        return new Promise<Array<Array<number>>>((resolve, reject) =>{
            AdminServer.gateway.apis.forEach((apiConfig)=>{
                if (api === apiConfig.name) {
                    if (path) {
                        let stats = AdminServer.gateway.createStats(Stats.getStatsKey('auth', 'fail', apiConfig.proxy.path))
                        stats.getLastOccurrences(path, 24, (err, result)=>{
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(result);
                            }
                        });

                    }
                }
            })
        });
    }
}
