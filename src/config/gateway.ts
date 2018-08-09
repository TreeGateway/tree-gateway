'use strict';

import * as Joi from 'joi';
import { AdminConfig, adminConfigValidatorSchema } from './admin';
import { AuthenticationConfig, authenticationValidatorSchema } from './authentication';
import { CacheConfig, cacheConfigValidatorSchema } from './cache';
import { CircuitBreakerConfig, circuitBreakerConfigValidatorSchema } from './circuit-breaker';
import { CorsConfig, corsConfigSchema } from './cors';
import { DatabaseConfig, databaseSchema } from './database';
import { ValidationError } from './errors';
import { AccessLoggerConfig, accessLoggerConfigSchema, LoggerConfig, loggerConfigSchema } from './logger';
import { MiddlewareConfig, middlewareConfigValidatorSchema } from './middleware';
import { ProtocolConfig, protocolConfigSchema } from './protocol';
import { ServiceDiscoveryConfig, serviceDiscoveryConfigValidatorSchema } from './service-discovery';
import { ThrottlingConfig, throttlingConfigValidatorSchema } from './throttling';

/**
 * The Server config descriptor.
 */
export interface ServerConfig {
    /**
     * Configurations for gateway database (REDIS).
     */
    database: DatabaseConfig;
    /**
     * Folder where the gateway will install its middleware functions.
     */
    middlewarePath?: string;
    /**
     * The root folder where the gateway will work.
     */
    rootPath?: string;
    /**
     * The gateway configuration.
     */
    gateway?: GatewayConfig;
}

/**
 * The Gateway config descriptor.
 */
export interface GatewayConfig {
    /**
     * The gateway protocol configuration
     */
    protocol: ProtocolConfig;
    /**
     * If we are behind a reverse proxy (Heroku, Bluemix, AWS if you use an ELB, custom Nginx setup, etc)
     */
    underProxy?: boolean;
    /**
     * By default, all responses are compressed by the gateway. If you want to disable it set this property to true.
     */
    disableCompression?: boolean;
    /**
     * Disable the validation of API Ids. If the id is not validated, the data could not be synchronizable
     * to TreeGateway dashboard.
     */
    disableApiIdValidation?: boolean;
    /**
     * Configurations for gateway logger.
     */
    logger?: LoggerConfig;
    /**
     * Configurations for gateway access logger.
     */
    accessLogger?: AccessLoggerConfig;
    /**
     * If provided, Configure the admin service for the gateway
     */
    admin?: AdminConfig;
    /**
     * Configure default cors support for API requests. It uses the [cors](https://www.npmjs.com/package/cors) module.
     * It can be configured also in the API configuration
     */
    cors?: CorsConfig;
    /**
     * Configure a timeout for the gateway http.Server. You can inform the amount of milisencods, or use
     * a [human-interval](https://www.npmjs.com/package/human-interval) string. Defaults to 'one minute'.
     */
    timeout?: string | number;
    /**
     * Add filters to the request pipeline. A Filter is a function that receives
     * the request and the response object and must return a boolean value to inform
     * it the given request should target the destination API or if it should be ignored.
     *
     * Example:
     * ```
     * module.exports = function (req) {
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
     *   { name: "myFilter"}
     * ]
     * ```
     */
    filter?: Array<MiddlewareConfig>;
    /**
     * Configuration for service discovery.
     */
    serviceDiscovery?: ServiceDiscoveryConfig;
    /**
     * Configure an healthcheck endpoint for the gateway. Provide here the path where the
     * healthcheck service will respond.
     */
    healthcheck?: string;
    /**
     * Configure how to handle errors during API pipeline.
     */
    errorHandler?: MiddlewareConfig;
    /**
     * Configure pipeline steps globally, to be imported by api configureations
     */
    config?: ApiPipelineConfig;
    /**
     * Inform how request analytics should be stored by the gateway
     */
    analytics?: RequestAnalyticsConfig;
}

/**
 * Inform how request analytics should be stored by the gateway
 */
export interface RequestAnalyticsConfig {
    /**
     * Enable log recording for the gateway requests
     */
    enabled?: boolean;
    /**
     * The logger middleware
     */
    logger?: MiddlewareConfig;
}

/**
 * Declare common configurations that can be used by different APIs.
 */
export interface ApiPipelineConfig {
    /**
     * Authentication configuration
     */
    authentication?: { [index: string]: AuthenticationConfig };
    /**
     * Cache configuration
     */
    cache?: { [index: string]: CacheConfig };
    /**
     * CircuitBreaker configuration
     */
    circuitBreaker?: { [index: string]: CircuitBreakerConfig };
    /**
     * Cors configuration
     */
    cors?: { [index: string]: CorsConfig };
    /**
     * Filter configuration
     */
    filter?: { [index: string]: MiddlewareConfig };
    /**
     * Throttling configuration
     */
    throttling?: { [index: string]: ThrottlingConfig };
    /**
     * Interceptors configuration
     */
    interceptor?: PipelineInterceptorConfig;
    /**
     * Error Handler configuration
     */
    errorHandler?: { [index: string]: MiddlewareConfig };
}

export interface PipelineInterceptorConfig {
    request?: { [index: string]: MiddlewareConfig };
    response?: { [index: string]: MiddlewareConfig };
}

const interceptorsSchema = Joi.object().keys({
    request: Joi.object().pattern(/\w+/, middlewareConfigValidatorSchema),
    response: Joi.object().pattern(/\w+/, middlewareConfigValidatorSchema)
});

const apiPipelineConfigSchema = Joi.object().keys({
    authentication: Joi.object().pattern(/\w+/, authenticationValidatorSchema),
    cache: Joi.object().pattern(/\w+/, cacheConfigValidatorSchema),
    circuitBreaker: Joi.object().pattern(/\w+/, circuitBreakerConfigValidatorSchema),
    cors: Joi.object().pattern(/\w+/, corsConfigSchema),
    errorHandler: Joi.object().pattern(/\w+/, middlewareConfigValidatorSchema),
    filter: Joi.object().pattern(/\w+/, middlewareConfigValidatorSchema),
    interceptor: interceptorsSchema,
    throttling: Joi.object().pattern(/\w+/, throttlingConfigValidatorSchema)
});

export const requestAnalyticsConfigSchema = Joi.object().keys({
    enabled: Joi.boolean(),
    logger: middlewareConfigValidatorSchema
});

export const gatewayConfigValidatorSchema = Joi.object().keys({
    accessLogger: accessLoggerConfigSchema,
    admin: adminConfigValidatorSchema,
    analytics: requestAnalyticsConfigSchema,
    config: apiPipelineConfigSchema,
    cors: corsConfigSchema,
    disableApiIdValidation: Joi.boolean(),
    disableCompression: Joi.boolean(),
    errorHandler: middlewareConfigValidatorSchema,
    filter: Joi.alternatives([Joi.array().items(middlewareConfigValidatorSchema), middlewareConfigValidatorSchema]),
    healthcheck: Joi.string(),
    logger: loggerConfigSchema,
    protocol: protocolConfigSchema,
    serviceDiscovery: serviceDiscoveryConfigValidatorSchema,
    timeout: Joi.alternatives([Joi.string(), Joi.number().positive()]),
    underProxy: Joi.boolean()
});

export let serverConfigValidatorSchema = Joi.object().keys({
    database: databaseSchema.required(),
    gateway: gatewayConfigValidatorSchema,
    middlewarePath: Joi.string().regex(/^[a-z\.\/][a-zA-Z0-9\-_\.\/]*$/),
    rootPath: Joi.string().regex(/^[a-z\.\/][a-zA-Z0-9\-_\.\/]*$/)
});

export function validateGatewayConfig(gatewayConfig: GatewayConfig) {
    return new Promise<GatewayConfig>((resolve, reject) => {
        Joi.validate(gatewayConfig, gatewayConfigValidatorSchema, (err, value) => {
            if (err) {
                reject(new ValidationError(err));
            } else {
                return resolve(value);
            }
        });
    });
}

export function validateServerConfig(config: ServerConfig) {
    return new Promise<ServerConfig>((resolve, reject) => {
        Joi.validate(config, serverConfigValidatorSchema, (err, value) => {
            if (err) {
                reject(new ValidationError(err));
            } else {
                return resolve(value);
            }
        });
    });
}
