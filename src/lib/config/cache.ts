"use strict";

import * as Joi from "joi";

export interface CacheConfig {
    /**
     * Configuration for a client side cache (in browser).
     */
    client?: ClientCacheConfig;
    /**
     * Configuration for a server side cache (in Memory or with a Redis store)
     */
    server?: ServerCacheConfig;
    /**
     * A list of groups that should be handled by this limiter. If not provided, everything
     * will be handled.
     * Defaults to *.
     */
    group?: Array<string>;
}

export interface ClientCacheConfig {
    cacheTime: string;
    cacheControl?: string;
    mustRevalidate?: boolean;
    noTransform?: boolean;
    proxyRevalidate?: boolean;
}

export interface ServerCacheConfig {
    cacheTime: string;
    binary?: boolean;
}

let ClientCacheValidatorSchema = Joi.object().keys({
    cacheTime: Joi.string().required(),
    cacheControl: Joi.string().valid('public', 'private', 'no-cache', 'no-store'),
    mustRevalidate: Joi.boolean(),
    noTransform: Joi.boolean(),
    proxyRevalidate: Joi.boolean()
});

let ServerCacheValidatorSchema = Joi.object().keys({
    cacheTime: Joi.string().required(),
    binary: Joi.boolean()
});

export let CacheConfigValidatorSchema = Joi.object().keys({
    client: ClientCacheValidatorSchema,
    server: ServerCacheValidatorSchema,
    group: Joi.array().items(Joi.string())
});

export function validateCacheConfig(cache: CacheConfig, callback: (err, value)=>void) {
    Joi.validate(cache, CacheConfigValidatorSchema, callback);
}