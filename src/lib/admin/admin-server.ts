"use strict";

import {Path, GET, PathParam, Errors} from "typescript-rest";
import "es6-promise";
import * as fs from "fs-extra";
import {Gateway} from "../gateway";
import {ApiConfig} from "../config/api";
import * as Utils from "underscore";
import * as path from "path";

export class AdminServer {
    static gateway: Gateway;
}

@Path('middlewareaa')
export class MiddlewareService {

    @GET
    @Path('filters')
    search() : Promise<Array<string>>{
        return new Promise<Array<string>>((resolve, reject) =>{
            fs.readdir(path.join(AdminServer.gateway.middlewarePath, 'filter'), (err, files) => {
                if (err) {
                    reject(new Errors.InternalServerError('Error reading installed filters.'));
                }
                resolve(files);
            });
        });
    }
}

@Path('apis')
export class APIService {
    @GET
    search() : Promise<Array<ApiConfig>>{
        return new Promise<Array<ApiConfig>>((resolve, reject) =>{
            resolve(AdminServer.gateway.apis);
        });
    }

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