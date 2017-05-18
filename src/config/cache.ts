'use strict';

import * as Joi from 'joi';
import { StatsConfig, statsConfigValidatorSchema } from './stats';

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
    preserveHeaders?: Array<string>;
    /**
     * If true, disabled the statistical data recording.
     */
    disableStats?: boolean;
    /**
     * Configurations for cache stats.
     */
    statsConfig?: StatsConfig;
}

const clientCacheValidatorSchema = Joi.object().keys({
    cacheControl: Joi.string().valid('public', 'private', 'no-cache', 'no-store'),
    cacheTime: Joi.string().required(),
    mustRevalidate: Joi.boolean(),
    noTransform: Joi.boolean(),
    proxyRevalidate: Joi.boolean()
});

const serverCacheValidatorSchema = Joi.object().keys({
    binary: Joi.boolean(),
    cacheTime: Joi.string().required(),
    disableStats: Joi.boolean(),
    preserveHeaders: Joi.array().items(Joi.string()),
    statsConfig: statsConfigValidatorSchema
});

export let cacheConfigValidatorSchema = Joi.object().keys({
    client: clientCacheValidatorSchema,
    group: Joi.array().items(Joi.string()),
    server: serverCacheValidatorSchema
});
