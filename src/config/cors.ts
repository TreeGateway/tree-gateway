'use strict';

import * as Joi from 'joi';

/**
 * Configure support for Cors requests.
 */
export interface CorsConfig {
    /**
     * Configures the Access-Control-Allow-Origin CORS header.
     */
    origin: CorsOrigin;
    /**
     * Configures the Access-Control-Allow-Methods CORS header.
     * Expects an array (ex: ['GET', 'PUT', 'POST']).
     */
    methods?: Array<string>;
    /**
     * Configures the Access-Control-Allow-Headers CORS header.
     * Expects an array (ex: ['Content-Type', 'Authorization']).
     * If not specified, defaults to reflecting the headers specified in the request's Access-Control-Request-Headers header.
     */
    allowedHeaders?: Array<string>;
    /**
     * Configures the Access-Control-Expose-Headers CORS header.
     * Expects an array (ex: ['Content-Range', 'X-Content-Range']).
     * If not specified, no custom headers are exposed.
     */
    exposedHeaders?: Array<string>;
    /**
     * Configures the Access-Control-Allow-Credentials CORS header.
     * Set to true to pass the header, otherwise it is omitted.
     */
    credentials?: boolean;
    /**
     * Configures the Access-Control-Max-Age CORS header.
     * Set to an [human-interval](https://www.npmjs.com/package/human-interval) string to pass the header, otherwise it is omitted.
     */
    maxAge?: string;
    /**
     * Pass the CORS preflight response to the next handler.
     */
    preflightContinue?: boolean;
}

/**
 * Configure support for Cors requests.
 */
export interface ApiCorsConfig extends CorsConfig {
    /**
     * A list of groups that will use this cors cofiguration
     */
    group?: Array<string>;
}

/**
 * Configures the Access-Control-Allow-Origin CORS header.
 */
export interface CorsOrigin {
    /**
     * If true, enable all origins to make cors requests.
     */
    enableAll?: boolean;
    /**
     * If true, disable all origins to make cors requests.
     */
    disableAll?: boolean;
    /**
     * Specify which origins are allowed.
     */
    allow?: Array<CorsOriginConfig>;
    /**
     * The name of an installed ```'cors/origin'``` middleware function, called to resolve
     * if the request should be allowed.
     */
    dynamic?: string;
}

/**
 * Configures the allowed cors origins.
 */
export interface CorsOriginConfig {
    /**
     * Use regular expressions to check origins that must be allowed.
     */
    regexp?: string;
    /**
     * The origin that must be allowed.
     */
    value?: string;
}

const corsOriginConfigSchema = Joi.object().keys({
    regexp: Joi.string(),
    value: Joi.string()
}).min(1).max(1);

const corsOriginSchema = Joi.object().keys({
    allow: Joi.array().items(corsOriginConfigSchema.min(1)),
    disableAll: Joi.boolean(),
    dynamic: Joi.string(),
    enableAll: Joi.boolean()
}).min(1).max(1);

export let apiCorsConfigSchema = Joi.object().keys({
    allowedHeaders: Joi.array().items(Joi.string()),
    credentials: Joi.boolean(),
    exposedHeaders: Joi.array().items(Joi.string()),
    group: Joi.array().items(Joi.string()),
    maxAge: Joi.string(),
    method: Joi.array().items(Joi.string().valid('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD')),
    origin: corsOriginSchema.required(),
    preflightContinue: Joi.boolean()
});

export let corsConfigSchema = Joi.object().keys({
    allowedHeaders: Joi.array().items(Joi.string()),
    credentials: Joi.boolean(),
    exposedHeaders: Joi.array().items(Joi.string()),
    maxAge: Joi.string(),
    method: Joi.array().items(Joi.string().valid('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD')),
    origin: corsOriginSchema.required(),
    preflightContinue: Joi.boolean()
});
