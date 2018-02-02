'use strict';

import * as Joi from 'joi';
import { ApiAuthenticationConfig, apiAuthenticationValidatorSchema } from './authentication';
import { ApiCorsConfig, apiCorsConfigSchema } from './cors';
import { ApiThrottlingConfig, apiThrottlingConfigValidatorSchema } from './throttling';
import { ApiCacheConfig, apiCacheConfigValidatorSchema } from './cache';
import { Proxy, proxyValidatorSchema } from './proxy';
import { Group, groupValidatorSchema } from './group';
import { ApiCircuitBreakerConfig, apiCircuitBreakerConfigValidatorSchema } from './circuit-breaker';
import { ApiFilter, apiFilterSchema } from './filter';
import { ValidationError } from '../error/errors';
import { MiddlewareConfig, middlewareConfigValidatorSchema } from './middleware';
import { ObjectID } from 'bson';

/**
 * The API config descriptor.
 */
export interface ApiConfig {
    /**
     * The API ID.
     */
    id?: string;
    /**
     * The API name. Used to identify the API on admin console.
     */
    name: string;
    /**
     * The API version. More than one version can be published for the same API.
     */
    version: string | number;
    /**
     * An optional description for API.
     */
    description?: string;
    /**
     * The path where the gateway will listen for requests that should be proxied
     * for the current API.
     */
    path: string;
    /**
     * Configuration for the API proxy engine.
     */
    proxy: Proxy;
    /**
     * Configure groups of endpoints
     */
    group?: Array<Group>;
    /**
     * Configuration for the rate limit engine.
     */
    throttling?: Array<ApiThrottlingConfig>;
    /**
     * Configuration for API authentication.
     */
    authentication?: ApiAuthenticationConfig;
    /**
     * Configuration for API cache.
     */
    cache?: Array<ApiCacheConfig>;
    /**
     * Configuration for api circuit breaker, following the pattern
     * [Circuit Breaker](http://doc.akka.io/docs/akka/snapshot/common/circuitbreaker.html).
     */
    circuitBreaker?: Array<ApiCircuitBreakerConfig>;
    /**
     * Configure cors support for API requests. It uses the [cors](https://www.npmjs.com/package/cors) module.
     */
    cors?: Array<ApiCorsConfig>;
    /**
     * Add filters to the request pipeline. A Filter is a function that receives
     * the request and the response object and must return a boolean value to inform
     * it the given request should target the destination API or if it should be ignored.
     *
     * Example:
     * ```
     * module.exports = function (req) {
     *   return true;
     * };
     * ```
     *
     * Each filter must be defined on its own .js file (placed on middleware/filter folder)
     * and the fileName must match: <filterName>.js.
     *
     * So, the above filter should be saved in a file called myFilter.js and configured as:
     * ```
     * filter:[
     *   {middleware: { name: "myFilter"} }
     * ]
     * ```
     */
    filter?: Array<ApiFilter>;
    /**
     * Configure how to handle errors during API pipeline.
     */
    errorHandler?: MiddlewareConfig;
}

export let apiConfigValidatorSchema = Joi.object().keys({
    authentication: apiAuthenticationValidatorSchema,
    cache: Joi.alternatives([Joi.array().items(apiCacheConfigValidatorSchema), apiCacheConfigValidatorSchema]),
    circuitBreaker: Joi.alternatives([Joi.array().items(apiCircuitBreakerConfigValidatorSchema), apiCircuitBreakerConfigValidatorSchema]),
    cors: Joi.alternatives([Joi.array().items(apiCorsConfigSchema), apiCorsConfigSchema]),
    description: Joi.string(),
    errorHandler: middlewareConfigValidatorSchema,
    filter: Joi.alternatives([Joi.array().items(apiFilterSchema), apiFilterSchema]),
    group: Joi.alternatives([Joi.array().items(groupValidatorSchema), groupValidatorSchema]),
    id: Joi.string(),
    name: Joi.string().min(3).required(),
    path: Joi.string().regex(/^[A-Za-z\-\/0-9_\.]+$/i).required(),
    proxy: proxyValidatorSchema.required(),
    throttling: Joi.alternatives([Joi.array().items(apiThrottlingConfigValidatorSchema), apiThrottlingConfigValidatorSchema]),
    version: Joi.alternatives(Joi.string(), Joi.number()).required()
});

export function validateApiConfig(apiConfig: ApiConfig, disableApiIdValidation: boolean) {
    return new Promise((resolve, reject) => {
        Joi.validate(apiConfig, apiConfigValidatorSchema, (err, value) => {
            if (err) {
                reject(new ValidationError(err));
            } else {
                if (disableApiIdValidation) {
                    return resolve(value);
                }
                if (value.id && !ObjectID.isValid(value.id)) {
                    return reject(new ValidationError(`Invalid API Id ${value.id}. The Id must be a valid ObjectID. To skip this validation, configure the 'disableApiIdValidation' property on tree-gateway.yml config file.`));
                }
                return resolve(value);
            }
        });
    });
}
