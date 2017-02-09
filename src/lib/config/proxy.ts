"use strict";

import * as Joi from "joi";
import {ValidationError} from "../error/errors";

/**
 * Configuration for the API proxy engine.
 */
export interface Proxy {
    /**
     * The path where the gateway will listen for requests that should be proxied
     * for the current API.
     */
    path: string;
    /**
     * The target address of the proxied API. You can force the protocol to be 
     * used on the URL, as:
     * ```
     * "target": {
     *      "path": "http://httpbin.org",
     *  }
     * 
     * ```
     * 
     * Or you can leave the decision for the gateway:
     * 
     * "target": {
     *      "path": "httpbin.org",
     *  }
     * 
     * So the gateway will use the same protocol used to access the gateway for the 
     * request to the target.
     * 
     * If you want to force https for the target API request, use the https option.  
     */
    target: Target;
    /**
     * If set to true, will enforce the requests to the API target to use HTTPS protocol.
     * f your path already define a protocol on target URL, this option is ignored.
     */
    https?: boolean;
    /**
     * If True, no Via header will be added to proxied responses.
     */
    supressViaHeader?: boolean;
    /**
     * Add filters to the request pipeline. A Filter is a function that receives
     * the request and the response object and must return a boolean value to inform
     * it the given request should target the destination API or if it should be ignored.
     * 
     * Example:
     * ```
     * module.exports = function (req, res) {
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
     *   {name: "myFilter"}
     * ]
     * ``` 
     */
    filter?: Array<Filter>,
    /**
     * Add interceptors to the request pipeline. An Interceptor is a function that receives
     * the request or the response object and can modify these objects.
     * 
     * You can define two types of interceptors: Request Interceptors or Response Interceptors.
     * 
     * Example of a request interceptor:
     * ```
     * module.exports = function(proxyReq, originalReq) {
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
     * module.exports = function(rsp, data, req, res, callback) {
     *    // rsp - original response from the target 
     *    data = JSON.parse(data.toString('utf8'));
     *    callback(null, JSON.stringify(data));
     *    // callback follow the node conventions ```callback(error, value)```
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
     *    request: ["myRequestInterceptor"]
     * }
     * ```
     * 
     * If more than one request or response interceptor are defined, they are executed in declaration order. 
     */
    interceptor?: Interceptors,
    /**
     * If true, the gateway will copy the host HTTP header to the proxied express server.
     */
    preserveHostHdr?: boolean;
    /**
     * Configure a specific timeout for requests. Timed-out requests will respond with 504 
     * status code and a X-Timeout-Reason header.
     */
    timeout?: number;
    /**
     * If true, disabled the statistical data recording.
     */
    disableStats?: boolean;
    /**
     * This sets the body size limit (default: 1mb). If the body size is larger than the specified (or default) 
     * limit, a 413 Request Entity Too Large error will be returned. See [bytes.js](https://www.npmjs.com/package/bytes) 
     * for a list of supported formats.
     */
    limit?: string;
    /**
     * Defaults to true.
     * When true, the host argument will be parsed on first request, and memoized for all subsequent requests.
     * When false, host argument will be parsed on each request.
     */
    memoizeHost?: boolean;
}

/**
 * Add filters to the request pipeline. A Filter is a function that receives
 * the request and the response object and must return a boolean value to inform
 * it the given request should target the destination API or if it should be ignored.
 */
export interface Filter {
    /**
     * The filter name.
     */
    name: string,
    /**
     * A list of groups that should be filtered by this filter. If not provided, everything
     * will be filtered.
     * Defaults to *.
     */
    group?: Array<string>;
}

/**
 * Add interceptors to the request pipeline. An Interceptor is a function that receives
 * the request or the response object and can modify these objects.
 */
export interface Interceptors {
    /**
     * A list of request interceptors
     */
    request: Array<Interceptor>;
    /**
     * A list of response interceptors
     */
    response: Array<Interceptor>;
}

/**
 * An Interceptor is a function that receives
 * the request or the response object and can modify these objects.
 */
export interface Interceptor {
    /**
     * The interceptor name.
     */
    name: string,
    /**
     * A list of groups that should be filtered by this filter. If not provided, everything
     * will be filtered.
     * Defaults to *.
     */
    group?: Array<string>;
}

export interface Target {
    path: string;
    /**
     * A list of allowed groups
     */
    allow?: Array<string>;
    /**
     * A list of denied groups
     */
    deny?: Array<string>;
}

let TargetSchema = Joi.object().keys({
    path: Joi.string().required(),
    allow: Joi.array().items(Joi.string().guid()),
    deny: Joi.array().items(Joi.string().guid()),
});

let FilterSchema = Joi.object().keys({
    name: Joi.string().required(),
    group: Joi.array().items(Joi.string().guid())
});

let InterceptorSchema = Joi.object().keys({
    name: Joi.string().required(),
    group: Joi.array().items(Joi.string().guid())
});

let InterceptorsSchema = Joi.object().keys({
    request: Joi.array().items(InterceptorSchema).required(),
    response: Joi.array().items(InterceptorSchema).required()
});

export let ProxyValidatorSchema = Joi.object().keys({
    path: Joi.string().regex(/^[a-z\-\/]+$/i).required(),
    target: TargetSchema.required(),
    https: Joi.boolean(),
    supressViaHeader: Joi.boolean(),
    filter: Joi.array().items(FilterSchema),
    interceptor: InterceptorsSchema,
    preserveHostHdr: Joi.boolean(),
    timeout: Joi.number(),
    disableStats: Joi.boolean(), 
    limit: Joi.string(),
    memoizeHost: Joi.boolean()
});

export function validateProxyConfig(proxy: Proxy) {
    return new Promise((resolve, reject) => {
        Joi.validate(proxy, ProxyValidatorSchema, (err, value) => {
            if (err) {
                reject(new ValidationError(err));
            } else {
                resolve(value);
            }
        })
    });
}