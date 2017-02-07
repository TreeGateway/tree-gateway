"use strict";

import "es6-promise";
import {Path, GET, POST, DELETE, PUT, PathParam, Errors, Return} from "typescript-rest";
import {ThrottlingConfig, validateThrottlingConfig} from "../../config/throttling";
import {ThrottlingService} from "../../service/api";
import {RestController} from "./admin-util";
import {AutoWired, Inject} from "typescript-ioc";

@Path('apis/:apiId/throttling')
@AutoWired
export class ThrottlingRest extends RestController {
    @Inject private service: ThrottlingService;

    @GET
    list(@PathParam("apiId") apiId: string): Promise<Array<ThrottlingConfig>>{
        return this.service.list(apiId);
    }

    @POST
    addThrottling(@PathParam("apiId") apiId: string, throttling: ThrottlingConfig): Promise<Return.NewResource> {
        return new Promise<Return.NewResource>((resolve, reject) => {
            validateThrottlingConfig(throttling)
                .catch(err => {
                    throw new Errors.ForbidenError(JSON.stringify(err));
                })
                .then(() => this.service.create(apiId, throttling))
                .then(throttlingId => resolve(new Return.NewResource(`apis/${apiId}/throttling/${throttlingId}`)))
                .catch(reject);
        });
    }

    @PUT
    @Path("/:throttlingId")
    updateThrottling(@PathParam("apiId") apiId: string,
                     @PathParam("throttlingId") throttlingId: string,
                     throttling: ThrottlingConfig): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            validateThrottlingConfig(throttling)
                .catch(err => {
                    throw new Errors.ForbidenError(JSON.stringify(err));
                })
                .then(() => this.service.update(apiId, throttlingId, throttling))
                .then(() => resolve())
                .catch((err) => reject(this.handleError(err)));
        });
    }

    @DELETE
    @Path("/:throttlingId")
    deleteThrottling(@PathParam("apiId") apiId: string,
                     @PathParam("throttlingId") throttlingId: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.service.remove(apiId, throttlingId)
                .then(() => resolve())
                .catch((err) => reject(this.handleError(err)));
        });
    }

    @GET
    @Path("/:throttlingId")
    getThrottling(@PathParam("apiId") apiId: string,
                  @PathParam("throttlingId") throttlingId: string) : Promise<ThrottlingConfig> {
        return new Promise((resolve, reject) => {
            this.service.get(apiId, throttlingId)
                .then(resolve)
                .catch((err) => reject(this.handleError(err)));
        });
    }
}