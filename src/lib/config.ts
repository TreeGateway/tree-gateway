"use strict";

/**
 * The API config descriptor.
 */
export interface Api {
    /**
     * The API name. Used to identify the API on admin console. 
     */
    name: string;
    /**
     * The API version. More than one version can be published for the same API.
     */
    version: string;
    /**
     * Configuration for the API proxy engine.
     */
    proxy: Proxy;
    /**
     * Configuration for the rate limit engine.
     */
    throttling?: Throttling;

    serviceDiscovery?: ServiceDiscovery;
}

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
    interceptor?: Interceptor,
    preserveHostHdr?: boolean;
    timeout?: number;
}

export interface ServiceDiscovery {
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
     * The status code to be sent on responses blocked by this filter.
     * Defaults to 404.
     */
    statusOnError?: number;
    /**
     * The message to be sent on responses blocked by this filter.
     * Defaults to Not Found.
     */
    errorMessage?: string;
}

/**
 * Add interceptors to the request pipeline. An Interceptor is a function that receives
 * the request or the response object and can modify these objects.
 */
export interface Interceptor {
    /**
     * A list of request interceptors
     */
    request: Array<string>;
    /**
     * A list of response interceptors
     */
    response: Array<string>;
}

export interface Target {
    path: string;
    allowPath?: Array<string>;
    denyPath?: Array<string>;
    allowMethod?: Array<string>;
    denyMethod?: Array<string>;
}

export interface Throttling {
    /**
     * milliseconds - how long to keep records of requests in memory. 
     * Defaults to 60000 (1 minute).  
     */
    windowMs?: number;
    /**
     * max number of connections during windowMs before starting to delay responses. 
     * Defaults to 1. Set to 0 to disable delaying.
     */
    delayAfter?: number;
    /**
     * milliseconds - how long to delay the response, multiplied by (number of recent hits - delayAfter). 
     * Defaults to 1000 (1 second). Set to 0 to disable delaying.
     */
    delayMs?: number;
    /**
     * max number of connections during windowMs milliseconds before sending a 429 response. 
     * Defaults to 5. Set to 0 to disable.
     */
    max?: number;
    /**
     * Error message returned when max is exceeded. 
     * Defaults to 'Too many requests, please try again later.'
     */
    message?: string;
    /**
     * HTTP status code returned when max is exceeded. 
     * Defaults to 429.
     */
    statusCode?: number;
    /**
     * Enable header to show request limit and current usage.
     */
    headers?: boolean;
    // keyGenerator: Function used to generate keys. By default user IP address (req.ip) is used. Defaults:
    // handler: The function to execute once the max limit is exceeded. It receives the request and the response objects. The "next" param is available if you need to pass to the next middleware. Defaults:
    /**
     * The storage to use when persisting rate limit attempts. 
     * By default, the MemoryStore is used. Possible values are: 
     * ```
     * memory
     * ```
     * And
     * ```
     * redis
     * ```
     */
    store?: string; 
}