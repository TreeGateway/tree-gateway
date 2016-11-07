"use strict";

import {Path, GET, PathParam} from "typescript-rest";
import "es6-promise";
import {Gateway} from "../gateway";
import {ApiConfig} from "../config/api";
import * as Utils from "underscore";

@Path('apis')
export class APIService {
    static gateway: Gateway;

    @GET
    search() : Promise<Array<ApiConfig>>{
        return new Promise<Array<ApiConfig>>((resolve, reject) =>{
            resolve(APIService.gateway.apis);
        });
    }

    @GET
    @Path(":name")
    getApi(@PathParam("name")name: string) : Promise<Array<ApiConfig>>{
        return new Promise<Array<ApiConfig>>((resolve, reject) =>{
            resolve(Utils.filter(APIService.gateway.apis, (apiConfig)=>{
                return name === apiConfig.name;
            }));
        });
    }


}