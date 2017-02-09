"use strict";

import "es6-promise";
import {Path, GET, POST, DELETE, PUT, PathParam, Errors, Return} from "typescript-rest";
import {ApiCorsConfig, validateApiCorsConfig} from "../../config/cors";
import {CorsService} from "../../service/api";
import {AutoWired, Inject} from "typescript-ioc";

@Path('apis/:apiId/cors')
@AutoWired
export class CorsRest {
     @Inject private service: CorsService;

    @GET
    list(@PathParam("apiId") apiId: string): Promise<Array<ApiCorsConfig>>{
        return this.service.list(apiId);
    }

    @POST
    addCors(@PathParam("apiId") apiId: string, cors: ApiCorsConfig): Promise<Return.NewResource> {
        return new Promise<Return.NewResource>((resolve, reject) => {
            validateApiCorsConfig(cors)
                .catch(err => {
                    throw new Errors.ForbidenError(JSON.stringify(err));
                })
                .then(() => this.service.create(apiId, cors))
                .then(corsId => resolve(new Return.NewResource(`apis/${apiId}/cors/${corsId}`)))
                .catch(reject);
        });
    }

    @PUT
    @Path("/:corsId")
    updateCors(@PathParam("apiId") apiId: string,
                     @PathParam("corsId") corsId: string,
                     cors: ApiCorsConfig): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            validateApiCorsConfig(cors)
                .catch(err => {
                    throw new Errors.ForbidenError(JSON.stringify(err));
                })
                .then(() => this.service.update(apiId, corsId, cors))
                .then(() => resolve())
                .catch(reject);
        });
    }

    @DELETE
    @Path("/:corsId")
    deleteCors(@PathParam("apiId") apiId: string,
                     @PathParam("corsId") corsId: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.service.remove(apiId, corsId)
                .then(() => resolve())
                .catch(reject);
        });
    }

    @GET
    @Path("/:corsId")
    getCors(@PathParam("apiId") apiId: string,
                  @PathParam("corsId") corsId: string) : Promise<ApiCorsConfig> {
        return new Promise((resolve, reject) => {
            this.service.get(apiId, corsId)
                .then(resolve)
                .catch(reject);
        });
    }
}