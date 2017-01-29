"use strict";

import * as Joi from "joi";

export interface CircuitBreakerConfig {
    /**
     * The circuit breaker ID.
     */
    id? : string;
    /**
     * Exceptions or calls exceeding the configured timeout increment a failure counter.
     * Expressed in miliseconds
     * 
     */
    timeout?: number;
    /**
     * After the configured resetTimeout, the circuit breaker enters a Half-Open state
     */
    resetTimeout?: number;
    /**
     * When the failure counter reaches a maxFailures count, the breaker is tripped into Open state
     * Expressed in miliseconds
     */
    maxFailures?: number;
    /**
     * A list of groups that should be handled by this limiter. If not provided, everything
     * will be handled.
     * Defaults to *.
     */
    group?: Array<string>;
    /**
     * If true, disabled the statistical data recording.
     */
    disableStats?: boolean;
    /**
     * The name of the function to execute once the circuit is open. 
     * It receives the API path being called.
     * 
     * For Example, on myOpenHandler.js file:
     * ```
     * module.exports = function (apiPath,) {
     *   sendEmail('Circuit Open', apiPath);
     * };
     * ```
     * This function must be saved on a js file:
     * ``` 
     * middleware/circuitbreaker/handler/myOpenHandler.js
     * ```
     */
    onOpen?: string;        
    /**
     * The name of the function to execute once the circuit is open. 
     * It receives the API path being called.
     * 
     * For Example, on myCloseHandler.js file:
     * ```
     * module.exports = function (apiPath) {
     *   sendEmail('Circuit Close', apiPath);
     * };
     * ```
     * This function must be saved on a js file:
     * ``` 
     * middleware/circuitbreaker/handler/myCloseHandler.js
     * ```
     */
    onClose?: string;        
    /**
     * The name of the function to execute once the circuit rejected (fast fail) a request. 
     * It receives the API path being called.
     * 
     * For Example, on myRejectHandler.js file:
     * ```
     * module.exports = function (apiPath) {
     *   sendEmail('Request rejected', apiPath);
     * };
     * ```
     * This function must be saved on a js file:
     * ``` 
     * middleware/circuitbreaker/handler/myRejectHandler.js
     * ```
     */
    onRejected?: string;
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

export let CircuitBreakerConfigValidatorSchema = Joi.object().keys({
    id: Joi.string().guid(),
    timeout: Joi.number(),
    resetTimeout: Joi.number(),
    maxFailures: Joi.number(),
    group: Joi.array().items(Joi.string()),
    disableStats: Joi.boolean(),
    onOpen: Joi.string(),
    onClose: Joi.string(),
    onRejected: Joi.string(),
    timeoutMessage: Joi.string(),
    timeoutStatusCode: Joi.number(),
    rejectMessage: Joi.string(),
    rejectStatusCode: Joi.number()    
});

export function validateCircuitBreakerConfig(circuitBreaker: CircuitBreakerConfig) {
    return new Promise((resolve, reject) => {
        Joi.validate(circuitBreaker, CircuitBreakerConfigValidatorSchema, (err, value)=>{
            if (err) {
                reject(err);
            } else {
                resolve(value);
            }
        });
    })
}