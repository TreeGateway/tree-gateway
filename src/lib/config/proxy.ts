"use strict";

import * as Joi from "joi";

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
    https?: boolean
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
    preserveHostHdr?: boolean;
    timeout?: number;
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
     * A list of paths that should be filtered by this filter. If not provided, all paths
     * will be filtered.
     * Defaults to *.
     */
    appliesTo?: Array<string>;
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
     * A list of paths that should be intercepted by this interceptor. If not provided, all paths
     * will be intercepted.
     * Defaults to *.
     */
    appliesTo?: Array<string>;
}

export interface Target {
    path: string;
    allow?: TargetFilter;
    deny?: TargetFilter;
}

export interface TargetFilter {
    path: Array<string>;
    method: Array<string>;
}

let TargetFilterSchema = Joi.object().keys({
    path: Joi.array().items(Joi.string().regex(/^[a-z\-\/]+$/i)).required(),
    method: Joi.array().items(Joi.string().valid('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD')).required(),
});

let TargetSchema = Joi.object().keys({
    path: Joi.string().required(),
    allow: TargetFilterSchema,
    deny: TargetFilterSchema,
});

let FilterSchema = Joi.object().keys({
    name: Joi.string().required(),
    appliesTo: Joi.array().items(Joi.string())
});

let InterceptorSchema = Joi.object().keys({
    name: Joi.string().required(),
    appliesTo: Joi.array().items(Joi.string())
});

let InterceptorsSchema = Joi.object().keys({
    request: Joi.array().items(InterceptorSchema).required(),
    response: Joi.array().items(InterceptorSchema).required()
});

export let ProxyValidatorSchema = Joi.object().keys({
    path: Joi.string().regex(/^[a-z\-\/]+$/i).required(),
    target: TargetSchema.required(),
    https: Joi.boolean(),
    filter: Joi.array().items(FilterSchema),
    interceptor: InterceptorsSchema,
    preserveHostHdr: Joi.boolean(),
    timeout: Joi.number()
});

export function validateProxyConfig(proxy: Proxy, callback: (err, value)=>void) {
    Joi.validate(proxy, ProxyValidatorSchema, callback);
}