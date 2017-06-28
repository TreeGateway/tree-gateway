'use strict';

import * as Joi from 'joi';
import { StatsConfig, statsConfigValidatorSchema } from './stats';
import { AdminConfig, adminConfigValidatorSchema } from './admin';
import { ProtocolConfig, protocolConfigSchema } from './protocol';
import { LoggerConfig, AccessLoggerConfig, loggerConfigSchema, accessLoggerConfigSchema } from './logger';
import { CorsConfig, corsConfigSchema } from './cors';
import { MiddlewareConfig, middlewareConfigValidatorSchema } from './middleware';
import { ServiceDiscoveryConfig, serviceDiscoveryConfigValidatorSchema } from './service-discovery';
import { ValidationError } from '../error/errors';

/**
 * The Server config descriptor.
 */
export interface ServerConfig {
    /**
     * Configurations for gateway database (REDIS).
     */
    database: RedisConfig;
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
}

export interface MonitorConfig {
    /**
     * The name of the monitor
     */
    name: string;
    /**
     * Configure how statistical data will be collected
     */
    statsConfig: StatsConfig;
}

export interface RedisConfig {
    /**
     * Configure the connection to a standalone Redis.
     */
    standalone?: RedisNodeConfig;
    /**
     * Configure client to use Redis Sentinel.
     */
    sentinel?: RedisSentinelConfig;
    /**
     * List of cluster nodes.
     */
    cluster?: RedisNodeConfig[];
    /**
     * Configure additional options to be passed to redis driver.
     */
    options?: RedisOptionsConfig;
}

export interface RedisNodeConfig {
    /**
     * The hostname of the redis node.
     */
    host: string;
    /**
     * The port of the redis node.
     */
    port?: string | number;
    /**
     * The password to connect on the redis node.
     */
    password?: string;
}

export interface RedisSentinelConfig {
    /**
     * List of sentinel nodes.
     */
    nodes: RedisNodeConfig[];
    /**
     * Group os instances to connect (master/slaves group).
     */
    name: string;
}

export interface RedisOptionsConfig {
    /**
     * Fallback password. Used when not defined in a node.
     */
    password?: string;
    /**
     * Prefix to be appended to all keys (defaults to '').
     */
    keyPrefix?: string;
    /**
     * Connection name, for monitoring purposes.
     */
    connectionName?: string;
    /**
     * Database index.
     */
    db?: number;
}

const redisNodeSchema = Joi.object().keys({
    host: Joi.string().required(),
    password: Joi.string(),
    port: Joi.alternatives([Joi.string(), Joi.number().positive()])
});

const redisConfigSchema = Joi.object().keys({
    cluster: Joi.array().items(redisNodeSchema),
    options: Joi.object().keys({
        connectionName: Joi.string(),
        db: Joi.number().positive(),
        keyPrefix: Joi.string(),
        password: Joi.string()
    }),
    sentinel: Joi.object().keys({
        name: Joi.string().required(),
        nodes: Joi.array().items(redisNodeSchema).required()
    }),
    standalone: redisNodeSchema
}).xor('standalone', 'sentinel', 'cluster');

const monitorConfigSchema = Joi.object().keys({
    name: Joi.string().valid('cpu', 'mem').required(),
    statsConfig: statsConfigValidatorSchema.required()
});

export const gatewayConfigValidatorSchema = Joi.object().keys({
    accessLogger: accessLoggerConfigSchema,
    admin: adminConfigValidatorSchema,
    cors: corsConfigSchema,
    filter: Joi.array().items(middlewareConfigValidatorSchema),
    logger: loggerConfigSchema,
    monitor: Joi.array().items(monitorConfigSchema),
    protocol: protocolConfigSchema.required(),
    serviceDiscovery: serviceDiscoveryConfigValidatorSchema,
    statsConfig: statsConfigValidatorSchema,
    timeout: Joi.alternatives([Joi.string(), Joi.number().positive()]),
    underProxy: Joi.boolean()
});

export let serverConfigValidatorSchema = Joi.object().keys({
    database: redisConfigSchema.required(),
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
