"use strict";

import "es6-promise";
import {Path, GET, POST, DELETE, PUT, PathParam, Errors, Return} from "typescript-rest";
import {CircuitBreakerConfig, validateCircuitBreakerConfig} from "../../config/circuit-breaker";
import {CircuitBreakerService} from "../../service/api";
import {RestController} from "./admin-util";
import {AutoWired, Inject} from "typescript-ioc";

@Path('apis/:apiId/circuitbreaker')
@AutoWired
export class CircuitBreakerRest extends RestController {
    @Inject private service: CircuitBreakerService;
 
    @GET
    list(@PathParam("apiId") apiId: string): Promise<Array<CircuitBreakerConfig>>{
        return this.service.list(apiId);
    }

    @POST
    addCircuitBreaker(@PathParam("apiId") apiId: string, circuitbreaker: CircuitBreakerConfig): Promise<Return.NewResource> {
        return new Promise<Return.NewResource>((resolve, reject) => {
            validateCircuitBreakerConfig(circuitbreaker)
                .catch(err => {
                    throw new Errors.ForbidenError(JSON.stringify(err));
                })
                .then(() => this.service.create(apiId, circuitbreaker))
                .then(circuitbreakerId => resolve(new Return.NewResource(`apis/${apiId}/circuitbreaker/${circuitbreakerId}`)))
                .catch(reject);
        });
    }

    @PUT
    @Path("/:circuitbreakerId")
    updateCircuitBreaker(@PathParam("apiId") apiId: string,
                     @PathParam("circuitbreakerId") circuitbreakerId: string,
                     circuitbreaker: CircuitBreakerConfig): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            validateCircuitBreakerConfig(circuitbreaker)
                .catch(err => {
                    throw new Errors.ForbidenError(JSON.stringify(err));
                })
                .then(() => this.service.update(apiId, circuitbreakerId, circuitbreaker))
                .then(() => resolve())
                .catch((err) => reject(this.handleError(err)));
        });
    }

    @DELETE
    @Path("/:circuitbreakerId")
    deleteCircuitBreaker(@PathParam("apiId") apiId: string,
                     @PathParam("circuitbreakerId") circuitbreakerId: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.service.remove(apiId, circuitbreakerId)
                .then(() => resolve())
                .catch((err) => reject(this.handleError(err)));
        });
    }

    @GET
    @Path("/:circuitbreakerId")
    getCircuitBreaker(@PathParam("apiId") apiId: string,
                  @PathParam("circuitbreakerId") circuitbreakerId: string) : Promise<CircuitBreakerConfig> {
        return new Promise((resolve, reject) => {
            this.service.get(apiId, circuitbreakerId)
                .then(resolve)
                .catch((err) => reject(this.handleError(err)));
        });
    }
}