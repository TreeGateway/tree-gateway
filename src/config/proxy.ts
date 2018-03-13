'use strict';

import * as Joi from 'joi';
import { MiddlewareConfig, middlewareConfigValidatorSchema } from './middleware';

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
     * Configure the [http.Agent](https://nodejs.org/api/http.html#http_class_http_agent) used
     * by proxy requests.
     */
    httpAgent?: HttpAgent;
    /**
     * If True, no Via header will be added to proxied responses.
     */
    supressViaHeader?: boolean;
    /**
     * If true, the gateway will copy the host HTTP header to the proxied server.
     */
    preserveHostHdr?: boolean;
    /**
     * Configure a specific timeout for requests. Timed-out requests will respond with 504
     * status code and a X-Timeout-Reason header. You can inform the amount of milisencods, or use
     * a [human-interval](https://www.npmjs.com/package/human-interval) string
     */
    timeout?: string | number;
    /**
     * This sets the body size limit (default: 1mb). If the body size is larger than the specified (or default)
     * limit, a 413 Request Entity Too Large error will be returned. See [bytes.js](https://www.npmjs.com/package/bytes)
     * for a list of supported formats.
     */
    limit?: string;
}

export interface Target {
    /**
     * The proxy target destination.
     */
    host?: string;
    /**
     * A dinamic router for proxy requests destination
     */
    router?: ProxyRouter;
    /**
     * A list of allowed groups
     */
    allow?: Array<string>;
    /**
     * A list of denied groups
     */
    deny?: Array<string>;
}

/**
 * A dinamic router for proxy requests
 */
export interface ProxyRouter {
    /**
     * if true use https protocol intead of http.
     */
    ssl: boolean;
    /**
     * Add a router middleware to the pipeline. A Router is a function that receives
     * the request object and must return a string value to inform
     * the target destination for this proxy.
     *
     * Example:
     * ```
     * module.exports = function (req) {
     *   return 'http://httpbin.org';
     * };
     * ```
     *
     * Each router must be defined on its own .js file (placed on middleware/proxy/router folder)
     * and the fileName must match: <routerName>.js.
     *
     * So, the above router should be saved in a file called myRouter.js and configured as:
     * ```
     * {middleware{ name: "myRouter"} }
     * ```
     */
    middleware?: MiddlewareConfig;
    /**
     * Add a serviceDiscovery middleware to the router pipeline. A ServiceDiscovery middleware is
     * a function that receives the desired service name and must return a string value to inform
     * the target destination for this proxy.
     *
     * Example:
     * ```
     * module.exports = function (serviceName) {
     *   return 'http://httpbin.org';
     * };
     * ```
     *
     * Each router must be defined on its own .js file (placed on middleware/servicediscovery/router folder)
     * and the fileName must match: <middlewareName>.js.
     *
     * So, the above router should be saved in a file called middlewareName.js and configured as:
     * ```
     * {middleware{ name: "middlewareName"} }
     * ```
     */
    serviceDiscovery?: MiddlewareConfig;
}

/**
 * Configure the [http.Agent](https://nodejs.org/api/http.html#http_class_http_agent) used
 * by proxy requests.
 */
export interface HttpAgent {
    /**
     * Keep sockets around in a pool to be used by other requests in the future. Defaults to true.
     */
    keepAlive?: boolean;
    /**
     * When using HTTP KeepAlive, how often to send TCP KeepAlive packets over sockets being kept alive.
     * You can inform the amount of milisencods, or use a [human-interval](https://www.npmjs.com/package/human-interval)
     * string. Default = ```'one second'```. Only relevant if keepAlive is set to true.
     */
    keepAliveTime?: string | number;
    /**
     * Sets the free socket to timeout after freeSocketKeepAliveTimeout milliseconds of inactivity on the free socket.
     * You can inform the amount of milisencods, or use a [human-interval](https://www.npmjs.com/package/human-interval)
     * string. Default is ```'15 seconds'```. Only relevant if keepAlive is set to true.
     */
    freeSocketKeepAliveTimeout?: string | number;
    /**
     * Maximum number of sockets to leave open in a free state. Only relevant if keepAlive is set to true. Default = 256.
     */
    maxFreeSockets?: number;
    /**
     * Maximum number of sockets to allow per host. Default = Infinity.
     */
    maxSockets?: number;
    /**
     * Sets the working socket to timeout after timeout milliseconds of inactivity on the working socket.
     * You can inform the amount of milisencods, or use a [human-interval](https://www.npmjs.com/package/human-interval)
     * string. Default is freeSocketKeepAliveTimeout * 2.
     */
    timeout?: string | number;
}

const routerConfigValidatorSchema = Joi.object().keys({
    middleware: middlewareConfigValidatorSchema,
    serviceDiscovery: middlewareConfigValidatorSchema,
    ssl: Joi.boolean()
}).or('middleware', 'serviceDiscovery');

const targetSchema = Joi.object().keys({
    allow: Joi.alternatives([Joi.array().items(Joi.string()), Joi.string()]),
    deny: Joi.alternatives([Joi.array().items(Joi.string()), Joi.string()]),
    host: Joi.string().uri(),
    router: routerConfigValidatorSchema
}).xor('host', 'router');

const httpAgentSchema = Joi.object().keys({
    freeSocketKeepAliveTimeout: Joi.alternatives([Joi.string(), Joi.number().positive()]),
    keepAlive: Joi.boolean(),
    keepAliveTime: Joi.alternatives([Joi.string(), Joi.number().positive()]),
    maxFreeSockets: Joi.number().positive(),
    maxSockets: Joi.number().positive(),
    timeout: Joi.alternatives([Joi.string(), Joi.number().positive()])
});

export const proxyValidatorSchema = Joi.object().keys({
    httpAgent: httpAgentSchema,
    limit: Joi.string(),
    preserveHostHdr: Joi.boolean(),
    supressViaHeader: Joi.boolean(),
    target: targetSchema.required(),
    timeout: Joi.alternatives([Joi.string(), Joi.number().positive()])
});
