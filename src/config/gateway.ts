'use strict';

import * as Joi from 'joi';
import { StatsConfig, statsConfigValidatorSchema } from './stats';
import { AdminConfig, adminConfigValidatorSchema } from './admin';
import { ProtocolConfig, protocolConfigSchema } from './protocol';
import { LoggerConfig, AccessLoggerConfig, loggerConfigSchema, accessLoggerConfigSchema } from './logger';
import { ValidationError } from '../error/errors';

/**
 * The API config descriptor.
 */
export interface ServerConfig {
    /**
     * Configurations for gateway database (REDIS).
     */
    database: RedisConfig;
    /**
     * Folder where the gateway will search for its middleware functions.
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
 * The API config descriptor.
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
     * Standalone redis configuration.
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
     * Redis connection options.
     */
    options?: RedisOptionsConfig;
}

export interface RedisNodeConfig {
    /**
     * Node host.
     */
    host: string;
    /**
     * Node port.
     */
    port?: string | number;
    /**
     * Node password.
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
    logger: loggerConfigSchema,
    monitor: Joi.array().items(monitorConfigSchema),
    protocol: protocolConfigSchema.required(),
    statsConfig: statsConfigValidatorSchema,
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
