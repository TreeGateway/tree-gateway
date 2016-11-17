"use strict";

import {Path, GET, POST, DELETE, PUT, PathParam, FileParam, FormParam, Errors, Return,
        Accept} from "typescript-rest";
import "es6-promise";
import {ApiConfig, validateApiConfig} from "../../config/api";
import {AdminServer} from "../admin-server";
import * as Utils from "underscore";

@Path('apis')
export class APIService {
    @GET
    search() : Promise<Array<ApiConfig>>{
        return new Promise<Array<ApiConfig>>((resolve, reject) =>{
            resolve(AdminServer.gateway.apis);
        });
    }

//     @POST
//     addApi(api: ApiConfig) {
//         validateApiConfig(api, (error, value:ApiConfig)=>{
// //            AdminServer.gateway.addApi(value);
//         })
//     }

    @GET
    @Path(":name")
    getApi(@PathParam("name")name: string) : Promise<Array<ApiConfig>>{
        return new Promise<Array<ApiConfig>>((resolve, reject) =>{
            resolve(Utils.filter(AdminServer.gateway.apis, (apiConfig)=>{
                return name === apiConfig.name;
            }));
        });
    }
}
