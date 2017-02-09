"use strict";

import * as Joi from "joi";
import {StatsConfig, StatsConfigValidatorSchema} from "./stats";
import {AdminConfig, AdminConfigValidatorSchema} from "./admin";
import {ProtocolConfig, ProtocolConfigSchema} from "./protocol";
import {LoggerConfig, AccessLoggerConfig, LoggerConfigSchema, AccessLoggerConfigSchema} from "./logger";
import {ValidationError} from "../error/errors";

/**
 * The API config descriptor.
 */
export interface GatewayConfig {
    /**
     * The gateway protocol configuration
     */
    protocol: ProtocolConfig;
    /**
     * Configurations for gateway database (REDIS).
     */
    database: RedisConfig;
    /**
     * The root folder where the gateway will work.
     */
    rootPath?: string;
    /**
     * Folder where the gateway will search for its middleware functions.
     */
    middlewarePath?: string;
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

export interface MonitorConfig{
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
    standalone?: RedisNodeConfig,
    /**
     * Configure client to use Redis Sentinel.
     */
    sentinel?: RedisSentinelConfig,
    /**
     * List of cluster nodes.
     */
    cluster?: RedisNodeConfig[],
    /**
     * Redis connection options.
     */
    options?: RedisOptionsConfig
}

export interface RedisNodeConfig {
    /**
     * Node host.
     */
    host: string,
    /**
     * Node port.
     */
    port?: number,
    /**
     * Node password.
     */
    password?: string
}

export interface RedisSentinelConfig {
    /**
     * List of sentinel nodes.
     */
    nodes: RedisNodeConfig[],
    /**
     * Group os instances to connect (master/slaves group).
     */
    name: string
}

export interface RedisOptionsConfig {
    /**
     * Fallback password. Used when not defined in a node.
     */
    password?: string,
    /**
     * Prefix to be appended to all keys (defaults to '').
     */
    keyPrefix?: string,
    /**
     * Connection name, for monitoring purposes.
     */
    connectionName?: string,
    /**
     * Database index.
     */
    db?: number
}

let RedisNodeSchema = Joi.object().keys({
    host: Joi.string().hostname(),
    port: Joi.number().positive(),
    password: Joi.string()
});

let RedisConfigSchema = Joi.object().keys({
    standalone: RedisNodeSchema,
    sentinel: Joi.object().keys({
        nodes: Joi.array().items(RedisNodeSchema).required(),
        name: Joi.string().required()
    }),
    cluster: Joi.array().items(RedisNodeSchema),
    options: Joi.object().keys({
        password: Joi.string(),
        keyPrefix: Joi.string(),
        connectionName: Joi.string(),
        db: Joi.number().positive()
    })
}).xor('standalone', 'sentinel', 'cluster');

let MonitorConfigSchema = Joi.object().keys({
    name: Joi.string().valid('cpu', 'mem').required(),
    statsConfig: StatsConfigValidatorSchema.required()
});

export let GatewayConfigValidatorSchema = Joi.object().keys({
    protocol: ProtocolConfigSchema.required(),
    database: RedisConfigSchema.required(),
    rootPath: Joi.string().regex(/^[a-z\.\/][a-zA-Z0-9\-_\.\/]*$/),
    middlewarePath: Joi.string().regex(/^[a-z\.\/][a-zA-Z0-9\-_\.\/]*$/),
    underProxy: Joi.boolean(),
    logger: LoggerConfigSchema,
    accessLogger: AccessLoggerConfigSchema,
    statsConfig: StatsConfigValidatorSchema,
    monitor: Joi.array().items(MonitorConfigSchema),
    admin: AdminConfigValidatorSchema
});

export function validateGatewayConfig(gatewayConfig: GatewayConfig) {
    return new Promise((resolve, reject) => {
        Joi.validate(gatewayConfig, GatewayConfigValidatorSchema, (err, value) => {
            if (err) {
                reject(new ValidationError(err));
            } else {
                resolve(value);
            }
        })
    });
}