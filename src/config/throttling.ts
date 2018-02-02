'use strict';

import * as Joi from 'joi';
import { StatsConfig, statsConfigValidatorSchema } from './stats';
import { MiddlewareConfig, middlewareConfigValidatorSchema } from './middleware';

export interface ThrottlingConfig {
    /**
     * How long to keep records of requests in memory. You can inform the amount of milisencods,
     * or use a [human-interval](https://www.npmjs.com/package/human-interval) string.
     * Defaults to '1 minute'
     */
    timeWindow?: number | string;
    /**
     * max number of connections during timeWindow before starting to delay responses.
     * Defaults to 1. Set to 0 to disable delaying.
     */
    delayAfter?: number;
    /**
     * How long to delay the response, multiplied by (number of recent hits - delayAfter).
     * You can inform the amount of milisencods, or use a [human-interval](https://www.npmjs.com/package/human-interval) string
     * Defaults to 0 (delaying disabled).
     */
    delay?: number | string;
    /**
     * max number of connections during timeWindow before sending a 429 response.
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
    keyGenerator?: MiddlewareConfig;
    /**
     * The name of the function used to skip requests. Returning true from the function
     *  will skip limiting for that request. Defaults:
     *
     * ```
     * module.exports = function (req, res) {
     *    return false;
     * };
     * ```
     * This function must be saved on a js file:
     * ```
     * middleware/throttling/skip/mySkipFunction.js
     * ```
     */
    skip?: MiddlewareConfig;
    /**
     * The name of the function to execute once the max limit is exceeded. It receives the request
     * and the response objects. The "next" param is available if you need to pass to the
     * next middleware.
     *
     * For Example, on myHandler.js file:
     * ```
     * module.exports = function (req, res, next) {
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
    handler?: MiddlewareConfig;
    /**
     * If true, disabled the statistical data recording.
     */
    disableStats?: boolean;
    /**
     * Configurations for throttling stats.
     */
    statsConfig?: StatsConfig;
}

export interface ApiThrottlingConfig extends ThrottlingConfig {
    /**
     * A list of groups that should be handled by this limiter. If not provided, everything
     * will be handled.
     * Defaults to *.
     */
    group?: Array<string>;
    /**
     * Import a configuration from gateway config session
     */
    use?: string;
}

export let throttlingConfigValidatorSchema = Joi.object().keys({
    delay: Joi.alternatives([Joi.string(), Joi.number().positive()]),
    delayAfter: Joi.number(),
    disableStats: Joi.boolean(),
    handler: middlewareConfigValidatorSchema,
    headers: Joi.boolean(),
    keyGenerator: middlewareConfigValidatorSchema,
    max: Joi.number(),
    message: Joi.string(),
    skip: middlewareConfigValidatorSchema,
    statsConfig: statsConfigValidatorSchema,
    statusCode: Joi.number(),
    timeWindow: Joi.alternatives([Joi.string(), Joi.number().positive()])
});

export let apiThrottlingConfigValidatorSchema = throttlingConfigValidatorSchema.keys({
    group: Joi.alternatives([Joi.array().items(Joi.string()), Joi.string()]),
    use: Joi.string()
});
