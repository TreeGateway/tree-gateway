"use strict";

import "es6-promise";
import {Path, GET, POST, DELETE, PUT, PathParam, Errors, Return} from "typescript-rest";
import {Proxy, validateProxyConfig} from "../../config/proxy";
import {ProxyService} from "../../service/api";
import {RestController} from "./admin-util";
import {AutoWired, Inject} from "typescript-ioc";

@Path('apis/:apiId/proxy')
@AutoWired
export class ProxyRest extends RestController {
    @Inject private service: ProxyService;

    @GET
    getProxy(@PathParam("apiId") apiId: string): Promise<Proxy> {
        return new Promise<Proxy>((resolve, reject) => {
            this.service.get(apiId)
                .then(resolve)
                .catch(err => reject(this.handleError(err)));
        })
    }

    @POST
    addProxy(@PathParam("apiId") apiId: string, proxy: Proxy): Promise<Return.NewResource> {
        return new Promise<Return.NewResource>((resolve, reject) => {
            validateProxyConfig(proxy)
                .catch(err => {
                    throw new Errors.ForbidenError(JSON.stringify(err));
                })
                .then(() => this.service.create(apiId, proxy))
                .then(() => resolve(new Return.NewResource(`apis/${apiId}/proxy`)))
                .catch(reject);
        });
    }

    @PUT
    updateProxy(@PathParam("apiId") apiId: string,
                proxy: Proxy): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            validateProxyConfig(proxy)
                .catch(err => {
                    throw new Errors.ForbidenError(JSON.stringify(err));
                })
                .then(() => this.service.update(apiId, proxy))
                .then(() => resolve())
                .catch((err) => reject(this.handleError(err)));
        });
    }

    @DELETE
    deleteProxy(@PathParam("apiId") apiId: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.service.remove(apiId)
                .then(() => resolve())
                .catch((err) => reject(this.handleError(err)));
        });
    }
}