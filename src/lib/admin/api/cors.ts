"use strict";

import "es6-promise";
import {Path, GET, POST, DELETE, PUT, PathParam, Errors, Return} from "typescript-rest";

import {CorsConfig, validateCorsConfig} from "../../config/cors";

import {RedisCorsService} from "../../service/redis";

import {RestController} from "./admin-util";

@Path('apis/:apiId/cors')
export class CorsRest extends RestController {
 
    @GET
    list(@PathParam("apiId") apiId: string): Promise<Array<CorsConfig>>{
        return this.service.list(apiId);
    }

    @POST
    addCors(@PathParam("apiId") apiId: string, cors: CorsConfig): Promise<Return.NewResource> {
        return new Promise<Return.NewResource>((resolve, reject) => {
            validateCorsConfig(cors)
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
                     cors: CorsConfig): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            validateCorsConfig(cors)
                .catch(err => {
                    throw new Errors.ForbidenError(JSON.stringify(err));
                })
                .then(() => this.service.update(apiId, corsId, cors))
                .then(() => resolve())
                .catch((err) => reject(this.handleError(err)));
        });
    }

    @DELETE
    @Path("/:corsId")
    deleteCors(@PathParam("apiId") apiId: string,
                     @PathParam("corsId") corsId: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.service.remove(apiId, corsId)
                .then(() => resolve())
                .catch((err) => reject(this.handleError(err)));
        });
    }

    @GET
    @Path("/:corsId")
    getCors(@PathParam("apiId") apiId: string,
                  @PathParam("corsId") corsId: string) : Promise<CorsConfig> {
        return new Promise((resolve, reject) => {
            this.service.get(apiId, corsId)
                .then(resolve)
                .catch((err) => reject(this.handleError(err)));
        });
    }

    get serviceClass() {
        return RedisCorsService;
    }
}