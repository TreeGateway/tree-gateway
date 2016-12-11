"use strict";

import * as Joi from "joi";

export interface ThrottlingConfig {
    /**
     * Throttling ID.
     */
    id?: string;
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
     * A list of groups that should be handled by this limiter. If not provided, everything
     * will be handled.
     * Defaults to *.
     */
    group?: Array<string>;
}

export let ThrottlingConfigValidatorSchema = Joi.object().keys({
    windowMs: Joi.number(),
    delayAfter: Joi.number(),
    delayMs: Joi.number(),
    max: Joi.number(),
    message: Joi.string(),
    statusCode: Joi.number(),
    headers: Joi.boolean(), 
    keyGenerator: Joi.string().alphanum(),
    handler: Joi.string().alphanum(),
    group: Joi.array().items(Joi.string())
});

export function validateThrottlingConfig(throttling: ThrottlingConfig) {
    return new Promise((resolve, reject) => {
        Joi.validate(throttling, ThrottlingConfigValidatorSchema, (err, value) => {
            if (err) {
                reject(err);
            } else {
                resolve(value);
            }
        })
    });
}