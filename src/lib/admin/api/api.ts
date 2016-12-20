"use strict";

import "es6-promise";
import {Path, GET, POST, DELETE, PUT, PathParam, Errors, Return, Accept} from "typescript-rest";
import {ApiConfig, validateApiConfig} from "../../config/api";

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
            // TODO: publish event
            validateApiConfig(api)
                .catch(err => {
                    throw new Errors.ForbidenError(JSON.stringify(err));
                })
                .then(() => this.service.create(api))
                .then(cacheId => resolve(new Return.NewResource(`apis/${api.name}`)))
                .catch(err => reject(this.handleError(err)));
        });
    }

    @PUT
    @Path("/:name")
    updateApi(@PathParam("name") name:string, api: ApiConfig): Promise<string> {
        return new Promise((resolve, reject) => {
            // TODO: publish event
            validateApiConfig(api)
                .catch(err => {
                    throw new Errors.ForbidenError(JSON.stringify(err));
                })
                .then(() => this.service.update(name, api))
                .then(() => resolve())
                .catch((err) => reject(this.handleError(err)));
        });
    }

    @DELETE
    @Path(":name")
    deleteApi(@PathParam("name") name: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            // TODO: publish event
            this.service.remove(name)
                .then(() => resolve())
                .catch((err) => reject(this.handleError(err)));
        });
    }

    @GET
    @Path(":name")
    getApi(@PathParam("name")name: string) : Promise<ApiConfig>{
        return new Promise((resolve, reject) => {
            this.service.get(name)
                .then(resolve)
                .catch((err) => reject(this.handleError(err)));
        });
    }

    get serviceClass() {
        return RedisApiService;
    }
}
