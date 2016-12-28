"use strict";

import "es6-promise";

import {Path, GET, POST, DELETE, PUT, PathParam, Errors, Return} from "typescript-rest";

import {Proxy, validateProxyConfig} from "../../config/proxy";

import {RedisProxyService} from "../../service/redis";

import {RestController} from "./admin-util";

@Path('apis/:apiName/:apiVersion/proxy')
export class ProxyRest extends RestController {
    @GET
    getProxy(@PathParam("apiName") apiName: string, @PathParam("apiVersion") apiVersion: string): Promise<Proxy> {
        return new Promise<Proxy>((resolve, reject) => {
            this.service.get(apiName, apiVersion)
                .then(resolve)
                .catch(err => reject(this.handleError(err)));
        })
    }

    @POST
    addProxy(@PathParam("apiName") apiName: string, @PathParam("apiVersion") apiVersion: string, proxy: Proxy): Promise<Return.NewResource> {
        return new Promise<Return.NewResource>((resolve, reject) => {
            validateProxyConfig(proxy)
                .catch(err => {
                    throw new Errors.ForbidenError(JSON.stringify(err));
                })
                .then(() => this.service.create(apiName, apiVersion, proxy))
                .then(() => resolve(new Return.NewResource(`apis/${apiName}/${apiVersion}/proxy`)))
                .catch(reject);
        });
    }

    @PUT
    updateProxy(@PathParam("apiName") apiName: string,
                @PathParam("apiVersion") apiVersion: string,
                proxy: Proxy): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            validateProxyConfig(proxy)
                .catch(err => {
                    throw new Errors.ForbidenError(JSON.stringify(err));
                })
                .then(() => this.service.update(apiName, apiVersion, proxy))
                .then(() => resolve())
                .catch((err) => reject(this.handleError(err)));
        });
    }

    @DELETE
    deleteProxy(@PathParam("apiName") apiName: string, @PathParam("apiVersion") apiVersion: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.service.remove(apiName, apiVersion)
                .then(() => resolve())
                .catch((err) => reject(this.handleError(err)));
        });
    }

    get serviceClass() {
        return RedisProxyService;
    }
}