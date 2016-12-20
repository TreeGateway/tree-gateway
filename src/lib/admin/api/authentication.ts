"use strict";

import "es6-promise";

import {Path, GET, POST, DELETE, PUT, PathParam, Errors, Return} from "typescript-rest";

import {AuthenticationConfig, validateAuthenticationConfig} from "../../config/authentication";

import {RedisAuthenticationService} from "../../service/redis";

import {RestController} from "./admin-util";

@Path('apis/:apiName/authentication')
export class AuthenticationRest extends RestController {
    @GET
    get(@PathParam("apiName") apiName: string): Promise<AuthenticationConfig> {
        return new Promise<AuthenticationConfig>((resolve, reject) => {
            this.service.get(apiName)
                .then(resolve)
                .catch(err => reject(this.handleError(err)));
        })
    }

    @POST
    add(@PathParam("apiName") apiName: string, auth: AuthenticationConfig): Promise<Return.NewResource> {
        return new Promise<Return.NewResource>((resolve, reject) => {
            validateAuthenticationConfig(auth)
                .catch(err => {
                    throw new Errors.ForbidenError(JSON.stringify(err));
                })
                .then(() => this.service.create(apiName, auth))
                .then(() => resolve(new Return.NewResource(`apis/${apiName}/authentication`)))
                .catch(reject);
        });
    }

    @PUT
    update(@PathParam("apiName") apiName: string, auth: AuthenticationConfig): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            // TODO: publish event
            validateAuthenticationConfig(auth)
                .catch(err => {
                    throw new Errors.ForbidenError(JSON.stringify(err));
                })
                .then(() => this.service.update(apiName, auth))
                .then(() => resolve())
                .catch((err) => reject(this.handleError(err)));
        });
    }

    @DELETE
    delete(@PathParam("apiName") apiName: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            // TODO: publish event
            this.service.remove(apiName)
                .then(() => resolve())
                .catch((err) => reject(this.handleError(err)));
        });
    }

    get serviceClass() {
        return RedisAuthenticationService;
    }
}