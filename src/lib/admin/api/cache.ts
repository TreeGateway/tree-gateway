"use strict";

import "es6-promise";

import {Path, GET, POST, DELETE, PUT, PathParam, Errors, Return} from "typescript-rest";

import {CacheConfig, validateCacheConfig} from "../../config/cache";

import {RedisCacheService} from "../../service/redis";

import {RestController} from "./admin-util";

@Path('apis/:apiId/cache')
export class CacheRest extends RestController {
    @GET
    list(@PathParam("apiId") apiId: string): Promise<Array<CacheConfig>> {
        return this.service.list(apiId);
    }

    @POST
    addCache(@PathParam("apiId") apiId: string, cache: CacheConfig): Promise<Return.NewResource> {
        return new Promise<Return.NewResource>((resolve, reject) => {
            validateCacheConfig(cache)
                .catch(err => {
                    throw new Errors.ForbidenError(JSON.stringify(err));
                })
                .then(() => this.service.create(apiId, cache))
                .then(cacheId => resolve(new Return.NewResource(`apis/${apiId}/cache/${cacheId}`)))
                .catch((err) => reject(this.handleError(err)));
        });
    }

    @PUT
    @Path("/:cacheId")
    updateCache(@PathParam("apiId") apiId: string,
                @PathParam("cacheId") cacheId: string,
                cache: CacheConfig): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            validateCacheConfig(cache)
                .catch(err => {
                    throw new Errors.ForbidenError(JSON.stringify(err));
                })
                .then(() => this.service.update(apiId, cacheId, cache))
                .then(() => resolve())
                .catch((err) => reject(this.handleError(err)));
        });
    }

    @DELETE
    @Path("/:cacheId")
    deleteCache(@PathParam("apiId") apiId: string,
                @PathParam("cacheId") cacheId: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.service.remove(apiId, cacheId)
                .then(() => resolve())
                .catch((err) => reject(this.handleError(err)));
        });
    }

    @GET
    @Path("/:cacheId")
    getCache(@PathParam("apiId") apiId: string,
             @PathParam("cacheId") cacheId: string) : Promise<CacheConfig> {
        return new Promise((resolve, reject) => {
            this.service.get(apiId, cacheId)
                .then(resolve)
                .catch((err) => reject(this.handleError(err)));
        });
    }

    get serviceClass() {
        return RedisCacheService;
    }
}