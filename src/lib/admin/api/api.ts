"use strict";

import "es6-promise";
import {Path, GET, POST, DELETE, PUT, PathParam, Errors, Return, Accept} from "typescript-rest";
import {ApiConfig, validateSimpleApiConfig} from "../../config/api";

import {RedisApiService} from "../../service/redis";

import {RestController} from "./admin-util";

@Path('apis')
export class APIRest extends RestController {

    @GET
    list(): Promise<Array<ApiConfig>>{
        return this.service.list();
    }

    @POST
    addApi(api: ApiConfig): Promise<string> {
        return new Promise((resolve, reject) => {
            validateSimpleApiConfig(api)
                .catch(err => {
                    throw new Errors.ForbidenError(JSON.stringify(err));
                })
                .then(() => this.service.create(api))
                .then(() => resolve(new Return.NewResource(`apis/${api.name}/${api.version}`)))
                .catch(err => reject(this.handleError(err)));
        });
    }

    @PUT
    @Path("/:name/:version")
    updateApi(@PathParam("name") name: string, @PathParam("version") version: string, api: ApiConfig): Promise<string> {
        return new Promise((resolve, reject) => {
            validateSimpleApiConfig(api)
                .catch(err => {
                    throw new Errors.ForbidenError(JSON.stringify(err));
                })
                .then(() => this.service.update(name, version, api))
                .then(() => resolve())
                .catch((err) => reject(this.handleError(err)));
        });
    }

    @DELETE
    @Path("/:name/:version")
    deleteApi(@PathParam("name") name: string, @PathParam("version") version: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.service.remove(name, version)
                .then(() => resolve())
                .catch((err) => reject(this.handleError(err)));
        });
    }

    @GET
    @Path("/:name/:version")
    getApi(@PathParam("name") name: string, @PathParam("version") version: string) : Promise<ApiConfig>{
        return new Promise((resolve, reject) => {
            this.service.get(name, version)
                .then(resolve)
                .catch((err) => reject(this.handleError(err)));
        });
    }

    get serviceClass() {
        return RedisApiService;
    }
}
