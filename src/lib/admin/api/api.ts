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
    addApi(api: ApiConfig): Promise<Return.NewResource> {
        return new Promise<Return.NewResource>((resolve, reject) => {
            validateSimpleApiConfig(api)
                .catch(err => {
                    throw new Errors.ForbidenError(JSON.stringify(err));
                })
                .then(() => this.service.create(api))
                .then(() => resolve(new Return.NewResource(`apis/${api.id}`)))
                .catch(err => reject(this.handleError(err)));
        });
    }

    @PUT
    @Path("/:id")
    updateApi(@PathParam("id") id: string, api: ApiConfig): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            api.id = id;

            validateSimpleApiConfig(api)
                .catch(err => {
                    throw new Errors.ForbidenError(JSON.stringify(err));
                })
                .then(() => this.service.update(api))
                .then(() => resolve())
                .catch((err) => reject(this.handleError(err)));
        });
    }

    @DELETE
    @Path("/:id")
    deleteApi(@PathParam("id") id: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.service.remove(id)
                .then(() => resolve())
                .catch((err) => reject(this.handleError(err)));
        });
    }

    @GET
    @Path("/:id")
    getApi(@PathParam("id") id: string) : Promise<ApiConfig>{
        return new Promise((resolve, reject) => {
            this.service.get(id)
                .then(resolve)
                .catch((err) => reject(this.handleError(err)));
        });
    }

    get serviceClass() {
        return RedisApiService;
    }
}
