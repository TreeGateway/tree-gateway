"use strict";

import "es6-promise";
import {Path, GET, POST, DELETE, PUT, PathParam, Errors, Return} from "typescript-rest";

import {ThrottlingConfig, validateThrottlingConfig} from "../../config/throttling";

import {RedisThrottlingService} from "../service/redis";
import {FileThrottlingService} from "../service/file";

import {RestController} from "./admin-util";

@Path('apis/:apiName/throttling')
export class ThrottlingRest extends RestController {
 
    @GET
    list(@PathParam("apiName") apiName: string): Promise<Array<ThrottlingConfig>>{
        return this.service.list(apiName);
    }

    @POST
    addThrottling(@PathParam("apiName") apiName: string, throttling: ThrottlingConfig): Promise<string> {
        return new Promise((resolve, reject) => {
            validateThrottlingConfig(throttling)
                .catch(err => {
                    throw new Errors.ForbidenError(JSON.stringify(err));
                })
                .then(() => this.service.create(apiName, throttling))
                .then(cacheId => resolve(new Return.NewResource(`apis/${apiName}/throttling/${throttling.id}`)))
                .catch(reject);
        });
    }

    @PUT
    @Path("/:throttlingId")
    updateThrottling(@PathParam("apiName") apiName: string,
                     @PathParam("throttlingId") throttlingId: string,
                     throttling: ThrottlingConfig): Promise<string> {
        return new Promise((resolve, reject) => {
            // TODO: publish event
            validateThrottlingConfig(throttling)
                .catch(err => {
                    throw new Errors.ForbidenError(JSON.stringify(err));
                })
                .then(() => this.service.update(apiName, throttlingId, throttling))
                .then(() => resolve())
                .catch((err) => reject(this.handleError(err)));
        });
    }

    @DELETE
    @Path("/:throttlingId")
    deleteThrottling(@PathParam("apiName") apiName: string,
                     @PathParam("throttlingId") throttlingId: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            // TODO: publish event
            this.service.remove(apiName, throttlingId)
                .then(() => resolve())
                .catch((err) => reject(this.handleError(err)));
        });
    }

    @GET
    @Path("/:throttlingId")
    getThrottling(@PathParam("apiName") apiName: string,
                  @PathParam("throttlingId") throttlingId: string) : Promise<ThrottlingConfig> {
        return new Promise((resolve, reject) => {
            this.service.get(apiName, throttlingId)
                .then(resolve)
                .catch((err) => reject(this.handleError(err)));
        });
    }

    get redisServiceClass() {
        return RedisThrottlingService;
    }

    get fileServiceClass() {
        return FileThrottlingService;
    }
}