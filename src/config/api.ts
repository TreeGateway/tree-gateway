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
import { ValidationError } from './errors';
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
    authentication?: Array<ApiAuthenticationConfig>;
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
     * Add interceptors to the request pipeline. An Interceptor is a function that receives
     * the request or the response object and can modify these objects.
     *
     * You can define two types of interceptors: Request Interceptors or Response Interceptors.
     *
     * Example of a request interceptor:
     * ```
     * module.exports = function(proxyReq) {
     *    // you can update headers
     *    proxyReq.headers['Content-Type'] = 'text/html';
     *    // you can change the method
     *    proxyReq.method = 'GET';
     *    // you can munge the bodyContent.
     *    proxyReq.bodyContent = proxyReq.bodyContent.replace(/losing/, 'winning!');
     *    return proxyReq;
     * };
     * ```
     *
     * Example of a response interceptor:
     * ```
     * module.exports = function(body, headers, request) {
     *    data = JSON.parse(body.toString('utf8'));
     *    return {body: data};
     * };
     * ```
     *
     * Each interceptor must be defined on its own .js file (placed on middleware/interceptor/[request | response] folder)
     * and the fileName must match: <interceptorName>.js.
     *
     * So, the above request interceptor should be saved in a file called
     * middleware/interceptor/request/myRequestInterceptor.js and configured as:
     *
     * ```
     * interceptor:{
     *    request: [{middleware{ name: "myRequestInterceptor"} }]
     * }
     * ```
     *
     * If more than one request or response interceptor are defined, they are executed in declaration order.
     */
    interceptor?: Interceptors;
    /**
     * Configure how to handle errors during API pipeline.
     */
    errorHandler?: MiddlewareConfig;
    /**
     * Disable all stats recording for this API
     */
    disableStats?: boolean;
    /**
     * Allows you to control when to parse the request body. Just enable it if you need to access the ```request.body```
     * inside a proxy middleware, like a ```filter``` or ```interceptor```. You can inform the expected
     * types of body you are expecting. [json, urlencoded, raw]
     */
    parseReqBody?: string | Array<string> | boolean;
    /**
     * Allows you to control when to parse the cookies. Just enable it if you need to access the ```request.cookies```
     * inside a proxy middleware, like a ```filter``` or ```interceptor```.
     */
    parseCookies?: boolean;
}

/**
 * Add interceptors to the request pipeline. An Interceptor is a function that receives
 * the request or the response object and can modify these objects.
 */
export interface Interceptors {
    /**
     * A list of request interceptors
     */
    request?: Array<Interceptor>;
    /**
     * A list of response interceptors
     */
    response?: Array<Interceptor>;
}

/**
 * An Interceptor is a function that receives
 * the request or the response object and can modify these objects.
 */
export interface Interceptor {
    /**
     * The interceptor to be used.
     */
    middleware: MiddlewareConfig;
    /**
     * A list of groups that should be filtered by this filter. If not provided, everything
     * will be filtered.
     * Defaults to *.
     */
    group?: Array<string>;
}

export interface ResponseInterceptorResult {
    body?: any;
    removeHeaders?: Array<string>;
    updateHeaders?: any;
}

const interceptorSchema = Joi.object().keys({
    group: Joi.alternatives([Joi.array().items(Joi.string()), Joi.string()]),
    middleware: middlewareConfigValidatorSchema.required()
});

const interceptorsSchema = Joi.object().keys({
    request: Joi.alternatives([Joi.array().items(interceptorSchema), interceptorSchema]),
    response: Joi.alternatives([Joi.array().items(interceptorSchema), interceptorSchema])
}).min(1);

export let apiConfigValidatorSchema = Joi.object().keys({
    authentication: Joi.alternatives([Joi.array().items(apiAuthenticationValidatorSchema), apiAuthenticationValidatorSchema]),
    cache: Joi.alternatives([Joi.array().items(apiCacheConfigValidatorSchema), apiCacheConfigValidatorSchema]),
    circuitBreaker: Joi.alternatives([Joi.array().items(apiCircuitBreakerConfigValidatorSchema), apiCircuitBreakerConfigValidatorSchema]),
    cors: Joi.alternatives([Joi.array().items(apiCorsConfigSchema), apiCorsConfigSchema]),
    description: Joi.string(),
    disableStats: Joi.boolean(),
    errorHandler: middlewareConfigValidatorSchema,
    filter: Joi.alternatives([Joi.array().items(apiFilterSchema), apiFilterSchema]),
    group: Joi.alternatives([Joi.array().items(groupValidatorSchema), groupValidatorSchema]),
    id: Joi.string(),
    interceptor: interceptorsSchema,
    name: Joi.string().min(3).required(),
    parseCookies: Joi.boolean(),
    parseReqBody: Joi.alternatives([Joi.string().valid('json', 'urlencoded', 'raw'), Joi.array().items(Joi.string().valid('json', 'urlencoded', 'raw')), Joi.boolean()]),
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
