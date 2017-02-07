"use strict";

import "es6-promise";

import {Path, GET, POST, DELETE, PUT, PathParam, Errors, Return} from "typescript-rest";
import {AuthenticationConfig, validateAuthenticationConfig} from "../../config/authentication";
import {AuthenticationService} from "../../service/api";
import {RestController} from "./admin-util";
import {AutoWired, Inject} from "typescript-ioc";

@Path('apis/:apiId/authentication')
@AutoWired
export class AuthenticationRest extends RestController {
    @Inject private service: AuthenticationService;

    @GET
    get(@PathParam("apiId") apiId: string): Promise<AuthenticationConfig> {
        return new Promise<AuthenticationConfig>((resolve, reject) => {
            this.service.get(apiId)
                .then(resolve)
                .catch(err => reject(this.handleError(err)));
        })
    }

    @POST
    add(@PathParam("apiId") apiId: string, auth: AuthenticationConfig): Promise<Return.NewResource> {

        return new Promise<Return.NewResource>((resolve, reject) => {
            validateAuthenticationConfig(auth)
                .catch(err => {
                    throw new Errors.ForbidenError(JSON.stringify(err));
                })
                .then(() => this.service.create(apiId, auth))
                .then(() => resolve(new Return.NewResource(`apis/${apiId}/authentication`)))
                .catch(reject);
        });
    }

    @PUT
    update(@PathParam("apiId") apiId: string, auth: AuthenticationConfig): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            validateAuthenticationConfig(auth)
                .catch(err => {
                    throw new Errors.ForbidenError(JSON.stringify(err));
                })
                .then(() => this.service.update(apiId, auth))
                .then(() => resolve())
                .catch((err) => reject(this.handleError(err)));
        });
    }

    @DELETE
    delete(@PathParam("apiId") apiId: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.service.remove(apiId)
                .then(() => resolve())
                .catch((err) => reject(this.handleError(err)));
        });
    }
}