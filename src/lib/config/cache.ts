"use strict";

import * as Joi from "joi";

export interface CacheConfig {
    /**
     * The cache ID.
     */
    id?: string;
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
    preserveHeaders?: Array<string>;
    /**
     * If true, disabled the statistical data recording.
     */
    disableStats?: boolean;
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
    binary: Joi.boolean(),
    preserveHeaders: Joi.array().items(Joi.string()),
    disableStats: Joi.boolean()
});

export let CacheConfigValidatorSchema = Joi.object().keys({
    id: Joi.string().guid(),
    client: ClientCacheValidatorSchema,
    server: ServerCacheValidatorSchema,
    group: Joi.array().items(Joi.string())
});

export function validateCacheConfig(cache: CacheConfig) {
    return new Promise((resolve, reject) => {
        Joi.validate(cache, CacheConfigValidatorSchema, (err, value) => {
            if (err) {
                reject(err);
            } else {
                resolve(value);
            }
        })
    });
}