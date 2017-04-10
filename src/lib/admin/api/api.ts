"use strict";

import "es6-promise";
import {Path, GET, POST, DELETE, PUT, PathParam, Errors, Return, Accept} from "typescript-rest";
import {ApiConfig, validateApiConfig} from "../../config/api";
import {ApiService} from "../../service/api";
import {AutoWired, Inject} from "typescript-ioc";

@Path('apis')
@AutoWired
export class APIRest {
    @Inject private service: ApiService;

    @GET
    list(): Promise<Array<ApiConfig>>{
        return this.service.list();
    }

    @POST
    addApi(api: ApiConfig): Promise<Return.NewResource> {
        return new Promise<Return.NewResource>((resolve, reject) => {
            validateApiConfig(api)
                .catch(err => {
                    throw new Errors.ForbidenError(JSON.stringify(err));
                })
                .then(() => this.service.create(api))
                .then((apiId) => resolve(new Return.NewResource(`apis/${apiId}`)))
                .catch(reject);
        });
    }

    @PUT
    @Path("/:id")
    updateApi(@PathParam("id") id: string, api: ApiConfig): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            api.id = id;

            validateApiConfig(api)
                .catch(err => {
                    throw new Errors.ForbidenError(JSON.stringify(err));
                })
                .then(() => this.service.update(api))
                .then(() => resolve())
                .catch(reject);
        });
    }

    @DELETE
    @Path("/:id")
    deleteApi(@PathParam("id") id: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.service.remove(id)
                .then(() => resolve())
                .catch(reject);
        });
    }

    @GET
    @Path("/:id")
    getApi(@PathParam("id") id: string) : Promise<ApiConfig>{
        return new Promise((resolve, reject) => {
            this.service.get(id)
                .then(resolve)
                .catch(reject);
        });
    }
}
