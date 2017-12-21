'use strict';

import * as Joi from 'joi';
import { StatsConfig, statsConfigValidatorSchema } from './stats';
import { AdminConfig, adminConfigValidatorSchema } from './admin';
import { ProtocolConfig, protocolConfigSchema } from './protocol';
import { LoggerConfig, AccessLoggerConfig, loggerConfigSchema, accessLoggerConfigSchema } from './logger';
import { CorsConfig, corsConfigSchema } from './cors';
import { MiddlewareConfig, middlewareConfigValidatorSchema } from './middleware';
import { ServiceDiscoveryConfig, serviceDiscoveryConfigValidatorSchema } from './service-discovery';
import { DatabaseConfig, databaseSchema } from './database';
import { ValidationError } from '../error/errors';

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
     * Force the validation of any API Id. If the id is not validated, the data could not be synchronizable
     * to Leanty dashboard.
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
     * Defaut configurations for gateway stats
     */
    statsConfig?: StatsConfig;
    /**
     * Create monitors for the gateway health
     */
    monitor?: Array<MonitorConfig>;
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
}

export interface MonitorConfig {
    /**
     * Alternative do MonitorConfig.id
     */
    id?: string;
    /**
     * The name of the monitor
     */
    name?: string;
    /**
     * Configure how statistical data will be collected
     */
    statsConfig: StatsConfig;
}

const monitorConfigSchema = Joi.object().keys({
    id: Joi.string().valid('cpu', 'mem', 'gc', 'event-loop'),
    name: Joi.string().valid('cpu', 'mem', 'gc', 'event-loop'),
    statsConfig: statsConfigValidatorSchema.required()
}).xor('id', 'name');

export const gatewayConfigValidatorSchema = Joi.object().keys({
    accessLogger: accessLoggerConfigSchema,
    admin: adminConfigValidatorSchema,
    cors: corsConfigSchema,
    disableApiIdValidation: Joi.boolean(),
    errorHandler: middlewareConfigValidatorSchema,
    filter: Joi.array().items(middlewareConfigValidatorSchema),
    healthcheck: Joi.string(),
    logger: loggerConfigSchema,
    monitor: Joi.array().items(monitorConfigSchema),
    protocol: protocolConfigSchema,
    serviceDiscovery: serviceDiscoveryConfigValidatorSchema,
    statsConfig: statsConfigValidatorSchema,
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
    const result = Joi.validate(gatewayConfig, gatewayConfigValidatorSchema);
    if (result.error) {
        throw new ValidationError(result.error);
    } else {
        return result.value;
    }
}

export function validateServerConfig(config: ServerConfig) {
    const result = Joi.validate(config, serverConfigValidatorSchema);
    if (result.error) {
        throw new ValidationError(result.error);
    } else {
        return result.value;
    }
}
