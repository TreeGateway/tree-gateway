"use strict";

import "es6-promise";

import {Path, GET, POST, DELETE, PUT, PathParam, Errors, Return} from "typescript-rest";

import {Proxy, validateProxyConfig} from "../../config/proxy";

import {RedisProxyService} from "../service/redis";
import {FileProxyService} from "../service/file";

import {RestController} from "./admin-util";

@Path('apis/:apiName/proxy')
export class ProxyRest extends RestController {
    @GET
    getProxy(@PathParam("apiName") apiName: string): Promise<Proxy> {
        return new Promise<Proxy>((resolve, reject) => {
            this.service.get(apiName)
                .then(resolve)
                .catch(err => reject(this.handleError(err)));
        })
    }

    @POST
    addProxy(@PathParam("apiName") apiName: string, proxy: Proxy): Promise<Return.NewResource> {
        return new Promise<Return.NewResource>((resolve, reject) => {
            validateProxyConfig(proxy)
                .catch(err => {
                    throw new Errors.ForbidenError(JSON.stringify(err));
                })
                .then(() => this.service.create(apiName, proxy))
                .then(() => resolve(new Return.NewResource(`apis/${apiName}/proxy`)))
                .catch(reject);
        });
    }

    @PUT
    updateProxy(@PathParam("apiName") apiName: string,
                proxy: Proxy): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            // TODO: publish event
            validateProxyConfig(proxy)
                .catch(err => {
                    throw new Errors.ForbidenError(JSON.stringify(err));
                })
                .then(() => this.service.update(apiName, proxy))
                .then(() => resolve())
                .catch((err) => reject(this.handleError(err)));
        });
    }

    @DELETE
    deleteGroup(@PathParam("apiName") apiName: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            // TODO: publish event
            this.service.remove(apiName)
                .then(() => resolve())
                .catch((err) => reject(this.handleError(err)));
        });
    }

    get redisServiceClass() {
        return RedisProxyService;
    }

    get fileServiceClass() {
        return FileProxyService;
    }
}