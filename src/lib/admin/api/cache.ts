"use strict";

import "es6-promise";

import {Path, GET, POST, DELETE, PUT, PathParam, Errors, Return} from "typescript-rest";

import {CacheConfig, validateCacheConfig} from "../../config/cache";

import {RedisCacheService} from "../service/redis";
import {FileCacheService} from "../service/file";

import {RestController} from "./admin-util";

@Path('apis/:apiName/cache')
export class CacheRest extends RestController {
    @GET
    list(@PathParam("apiName") apiName: string): Promise<Array<CacheConfig>> {
        return this.service.list(apiName);
    }

    @POST
    addCache(@PathParam("apiName") apiName: string, cache: CacheConfig): Promise<string> {
        return new Promise((resolve, reject) => {
            validateCacheConfig(cache)
                .catch(err => {
                    throw new Errors.ForbidenError(JSON.stringify(err));
                })
                .then(() => this.service.create(apiName, cache))
                .then(cacheId => resolve(new Return.NewResource(`apis/${apiName}/cache/${cacheId}`)))
                .catch((err) => reject(this.handleError(err)));
        });
    }

    @PUT
    @Path("/:cacheId")
    updateCache(@PathParam("apiName") apiName: string,
                @PathParam("cacheId") cacheId: string,
                cache: CacheConfig): Promise<string> {
        return new Promise((resolve, reject) => {
            // TODO: publish event
            validateCacheConfig(cache)
                .catch(err => {
                    throw new Errors.ForbidenError(JSON.stringify(err));
                })
                .then(() => this.service.update(apiName, cacheId, cache))
                .then(() => resolve())
                .catch((err) => reject(this.handleError(err)));
        });
    }

    @DELETE
    @Path("/:cacheId")
    deleteCache(@PathParam("apiName") apiName: string,
                @PathParam("cacheId") cacheId: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            // TODO: publish event
            this.service.remove(apiName, cacheId)
                .then(() => resolve())
                .catch((err) => reject(this.handleError(err)));
        });
    }

    @GET
    @Path("/:cacheId")
    getCache(@PathParam("apiName") apiName: string,
             @PathParam("cacheId") cacheId: string) : Promise<CacheConfig> {
        return new Promise((resolve, reject) => {
            this.service.get(apiName, cacheId)
                .then(resolve)
                .catch((err) => reject(this.handleError(err)));
        });
    }

    get redisServiceClass() {
        return RedisCacheService;
    }

    get fileServiceClass() {
        return null;
    }
}