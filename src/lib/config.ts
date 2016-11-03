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

    /**
     * Configuration for API authentication.
     */
    authentication?: Authentication;

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
    interceptor?: Interceptors,
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
    /**
     * The name of the function used to generate keys. By default user IP address (req.ip) is used.
     * For Example, on myKeyGen.js file:
     * ```
     * module.exports = function (req) {
     *    return req.ip;
     * };
     * ```
     * This function must be saved on a js file:
     * ``` 
     * middleware/throttling/keyGenerator/myKeyGen.js
     * ```
     */
    keyGenerator?: string;
    /**
     * The name of the function to execute once the max limit is exceeded. It receives the request 
     * and the response objects. The "next" param is available if you need to pass to the 
     * next middleware.
     * 
     * For Example, on myHandler.js file:
     * ```
     * module.exports = function (req, res) {
     *   res.format({
     *      html: function(){
     *         res.status(options.statusCode).end(options.message);
     *      },
     *      json: function(){
     *         res.status(options.statusCode).json({ message: options.message });
     *      }
     *   });
     * };
     * ```
     * This function must be saved on a js file:
     * ``` 
     * middleware/throttling/handler/myHandler.js
     * ```
     */
    handler?: string;
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

export interface Authentication {
    jwt?: JWTAuthenticatin;
    basic?: BasicAuthenticatin;
}

export interface BasicAuthenticatin {
    /**
     * Is a function with the parameters verify(userid, password, done) {
     *  - userid The username.
     *  - password The password.
     *  - done is a passport error first callback accepting arguments done(error, user, info)
     */    
    verify: string;
}

export interface JWTAuthenticatin {
    /**
     * Is a REQUIRED string or buffer containing the secret (symmetric) 
     * or PEM-encoded public key (asymmetric) for verifying the token's signature.
     */
    secretOrKey:string;
    /**
     * Defines how the JWT token will be extracted from request.
     */
    extractFrom?: JWTRequestExtractor; 
    /**
     * If defined the token issuer (iss) will be verified against this value.
     */
    issuer?: string;
    /**
     * If defined, the token audience (aud) will be verified against this value.
     */
    audience?: string;
    /**
     * List of strings with the names of the allowed algorithms. For instance, ["HS256", "HS384"].
     */
    algorithms: Array<string>;
    /**
     * If true do not validate the expiration of the token.
     */
    ignoreExpiration?: boolean;
    /**
     * Is a function with the parameters verify(request, jwt_payload, done) 
     *  - request The user request.
     *  - jwt_payload is an object literal containing the decoded JWT payload.
     *  - done is a passport error first callback accepting arguments done(error, user, info)
     */    
    verify?: string;
}

export interface JWTRequestExtractor {
    header?: string;
    queryParam?: string;
    authHeader?: string;
    bodyField?: string;
    cookie?: string;
}
