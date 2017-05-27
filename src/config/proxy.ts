'use strict';

import * as Joi from 'joi';
import { StatsConfig, statsConfigValidatorSchema } from './stats';

/**
 * Configuration for the API proxy engine.
 */
export interface Proxy {
    /**
     * The target address of the proxied API. You can force the protocol to be
     * used on the URL, as:
     * ```
     * "target": {
     *      "host": "http://httpbin.org",
     *  }
     *
     * ```
     *
     * Or you can leave the decision for the gateway:
     *
     * "target": {
     *      "host": "httpbin.org",
     *  }
     *
     * So the gateway will use the same protocol used to access the gateway for the
     * request to the target.
     *
     * If you want to force https for the target API request, use the https option.
     */
    target: Target;
    /**
     * Optional configurations for the [http.Agent](https://nodejs.org/api/http.html#http_class_http_agent) to be used
     * by proxy requests.
     */
    httpAgent?: HttpAgent;
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
    filter?: Array<Filter>;
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
    interceptor?: Interceptors;
    /**
     * If true, the gateway will copy the host HTTP header to the proxied express server.
     */
    preserveHostHdr?: boolean;
    /**
     * Configure a specific timeout for requests. Timed-out requests will respond with 504
     * status code and a X-Timeout-Reason header. You can inform the amount of milisencods, or use
     * a [human-interval](https://www.npmjs.com/package/human-interval) string
     */
    timeout?: string | number;
    /**
     * If true, disable the statistical data recording.
     */
    disableStats?: boolean;
    /**
     * Configurations for api requests stats.
     */
    statsConfig?: StatsConfig;
    /**
     * This sets the body size limit (default: 1mb). If the body size is larger than the specified (or default)
     * limit, a 413 Request Entity Too Large error will be returned. See [bytes.js](https://www.npmjs.com/package/bytes)
     * for a list of supported formats.
     */
    limit?: string;
    /**
     * Allows you to control when to parse the request body. Just enable it if you need to access the ```request.body```
     * inside a proxy middleware, like a ```filter``` or ```interceptor```.
     */
    parseReqBody?: boolean;
    /**
     * Allows you to control when to parse the response data. Just enable it if you need to access the ```response body```
     * inside a proxy ```response interceptor``` middleware.
     */
    parseResBody?: boolean;
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
    name: string;
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
    name: string;
    /**
     * A list of groups that should be filtered by this filter. If not provided, everything
     * will be filtered.
     * Defaults to *.
     */
    group?: Array<string>;
}

export interface Target {
    /**
     * The proxy target host.
     */
    host: string;
    /**
     * A list of allowed groups
     */
    allow?: Array<string>;
    /**
     * A list of denied groups
     */
    deny?: Array<string>;
}

export interface HttpAgent {
    keepAlive?: boolean;
    keepAliveTime?: string | number;
    keepAliveTimeout?: string | number;
    maxFreeSockets?: number;
    maxSockets?: number;
    timeout?: string | number;
}

const targetSchema = Joi.object().keys({
    allow: Joi.array().items(Joi.string()),
    deny: Joi.array().items(Joi.string()),
    host: Joi.string().required()
});

const httpAgentSchema = Joi.object().keys({
    keepAlive: Joi.boolean(),
    keepAliveTime: Joi.alternatives([Joi.string(), Joi.number().positive()]),
    keepAliveTimeout: Joi.alternatives([Joi.string(), Joi.number().positive()]),
    maxFreeSockets: Joi.number().positive(),
    maxSockets: Joi.number().positive(),
    timeout: Joi.alternatives([Joi.string(), Joi.number().positive()])
});

const filterSchema = Joi.object().keys({
    group: Joi.array().items(Joi.string()),
    name: Joi.string().required()
});

const interceptorSchema = Joi.object().keys({
    group: Joi.array().items(Joi.string()),
    name: Joi.string().required()
});

const interceptorsSchema = Joi.object().keys({
    request: Joi.array().items(interceptorSchema).required(),
    response: Joi.array().items(interceptorSchema).required()
});

export const proxyValidatorSchema = Joi.object().keys({
    disableStats: Joi.boolean(),
    filter: Joi.array().items(filterSchema),
    httpAgent: httpAgentSchema,
    interceptor: interceptorsSchema,
    limit: Joi.string(),
    memoizeHost: Joi.boolean(),
    parseReqBody: Joi.boolean(),
    parseResBody: Joi.boolean(),
    preserveHostHdr: Joi.boolean(),
    statsConfig: statsConfigValidatorSchema,
    supressViaHeader: Joi.boolean(),
    target: targetSchema.required(),
    timeout: Joi.alternatives([Joi.string(), Joi.number().positive()])
});
