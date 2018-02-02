'use strict';

import * as Joi from 'joi';
import { StatsConfig, statsConfigValidatorSchema } from './stats';
import { MiddlewareConfig, middlewareConfigValidatorSchema } from './middleware';

/**
 * Configuer the circuit breaker for API requests.
 */
export interface CircuitBreakerConfig {
    /**
     * Exceptions or calls exceeding the configured timeout increment a failure counter.
     * You can inform the amount of milisencods, or use a
     * [human-interval](https://www.npmjs.com/package/human-interval) string.
     * Defaults to '30 seconds'
     */
    timeout?: string | number;
    /**
     * After the configured resetTimeout, the circuit breaker enters a Half-Open state
     * You can inform the amount of milisencods, or use a
     * [human-interval](https://www.npmjs.com/package/human-interval) string.
     * Defaults to '2 minutes'
     */
    resetTimeout?: string | number;
    /**
     * Define a time window to count the api failures. If defined, the gateway will reset the total failures count
     * by each period of time defined here.
     */
    timeWindow?: string | number;
    /**
     * When the failure counter reaches a maxFailures count, the breaker is tripped into Open state.
     */
    maxFailures?: number;
    /**
     * If true, disabled the statistical data recording.
     */
    disableStats?: boolean;
    /**
     * Configurations for circuitbreaker stats.
     */
    statsConfig?: StatsConfig;
    /**
     * The name of the function to execute once the circuit is open.
     * It receives the API path being called.
     *
     * For Example, on myOpenHandler.js file:
     * ```
     * module.exports = function (apiPath, event) {
     *   sendEmail('Circuit Open', apiPath);
     * };
     * ```
     * This function must be saved on a js file:
     * ```
     * middleware/circuitbreaker/myOpenHandler.js
     * ```
     */
    onOpen?: MiddlewareConfig;
    /**
     * The name of the function to execute once the circuit is open.
     * It receives the API path being called.
     *
     * For Example, on myCloseHandler.js file:
     * ```
     * module.exports = function (apiPath, event) {
     *   sendEmail('Circuit Close', apiPath);
     * };
     * ```
     * This function must be saved on a js file:
     * ```
     * middleware/circuitbreaker/myCloseHandler.js
     * ```
     */
    onClose?: MiddlewareConfig;
    /**
     * The name of the function to execute once the circuit rejected (fast fail) a request.
     * It receives the API path being called.
     *
     * For Example, on myRejectHandler.js file:
     * ```
     * module.exports = function (apiPath, event) {
     *   sendEmail('Request rejected', apiPath);
     * };
     * ```
     * This function must be saved on a js file:
     * ```
     * middleware/circuitbreaker/myRejectHandler.js
     * ```
     */
    onRejected?: MiddlewareConfig;
    /**
     * Message to be sent when an api call occurs in a timeout.
     * Defaults to: Operation timeout
     */
    timeoutMessage?: string;
    /**
     * Status code to be sent when an api call occurs in a timeout.
     * Defaults to 504
     */
    timeoutStatusCode?: number;
    /**
     * Message to be sent when an api call is rejected because circuit is open
     * Defaults to: Service unavailable
     */
    rejectMessage?: string;
    /**
     * Status code to be sent when an api call is rejected because circuit is open
     * Defaults to 503
     */
    rejectStatusCode?: number;
}

export interface ApiCircuitBreakerConfig extends CircuitBreakerConfig {
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

export let circuitBreakerConfigValidatorSchema = Joi.object().keys({
    disableStats: Joi.boolean(),
    maxFailures: Joi.number(),
    onClose: middlewareConfigValidatorSchema,
    onOpen: middlewareConfigValidatorSchema,
    onRejected: middlewareConfigValidatorSchema,
    rejectMessage: Joi.string(),
    rejectStatusCode: Joi.number(),
    resetTimeout: Joi.alternatives([Joi.string(), Joi.number().positive()]),
    statsConfig: statsConfigValidatorSchema,
    timeWindow: Joi.alternatives([Joi.string(), Joi.number().positive()]),
    timeout: Joi.alternatives([Joi.string(), Joi.number().positive()]),
    timeoutMessage: Joi.string(),
    timeoutStatusCode: Joi.number()
});

export let apiCircuitBreakerConfigValidatorSchema = circuitBreakerConfigValidatorSchema.keys({
    group: Joi.alternatives([Joi.array().items(Joi.string()), Joi.string()]),
    use: Joi.string()
});
