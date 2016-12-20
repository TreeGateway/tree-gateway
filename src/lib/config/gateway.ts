"use strict";

import * as Joi from "joi";
import {StatsConfig, StatsConfigValidatorSchema} from "./stats";

/**
 * The API config descriptor.
 */
export interface GatewayConfig {
    /**
     * The gateway port
     */
    listenPort: number;
    /**
     * The gateway admin server port
     */
    adminPort: number;
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
     * Configurations for gateway access logger.
     */
    adminLogger?: AccessLoggerConfig;

    statsConfig?: StatsConfig;
    /**
     * If true, disabled the statistical data recording for admin tasks.
     */
    disableAdminStats?: boolean;
    /**
     * Create monitors for the gateway health
     */
    monitor?: Array<MonitorConfig>;
}

export interface AccessLoggerConfig {
    /**
     * customize the default logging message. 
     * E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}", "HTTP {{req.method}} {{req.url}}".
     */
    msg?: string;  
    /**
     * Use the default Express/morgan request formatting. 
     * Enabling this will override any msg if true. Will only output colors when colorize set to true
     */
    expressFormat?: boolean; 
    /**
     * Color the text and status code, using the Express/morgan color palette 
     * (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
     */
    colorize?: boolean;     
    console?: LogConsoleConfig;
    file?: LogFileConfig;
    /**
     * If true, disabled the statistical data recording.
     */
    disableStats?: boolean;
}

export interface MonitorConfig{
    name: string;
    statsConfig: StatsConfig;
}

export interface RedisConfig {
    host: string;
    port: number;
    db: number;
}

export interface LoggerConfig {
    /**
     * Level of messages that this logger should log.
     */
    level?: string;
    console?: LogConsoleConfig;
    file?: LogFileConfig;
}

export interface LogConsoleConfig {
    /**
     * flag indicating if we should prepend output with timestamps (default true). 
     */
    timestamp?: boolean;
    /**
     * Flag indicating whether to suppress output.
     */
    silent?: boolean; 
    /**
     * Flag indicating if we should colorize output.
     */
    colorize?: boolean; 
    /**
     * If true, messages will be logged as JSON (default true).
     */
    json?: boolean;
    /**
     * Flag indiciating if the output should be passed through JSON.stringify, 
     * resulting in single-line output. Most useful when used in conjunction with 
     * the json flag. (default false)
     */
    stringify?: boolean; 
    /**
     * If true, additional JSON metadata objects that are added to logging string 
     * messages will be displayed as a JSON string representation.  
     */
    prettyPrint?: boolean;
    /**
     * Numeric indicating how many times to recurse while formatting the object with util.inspect 
     * (only used with prettyPrint: true) 
     * (default null, unlimited)
     */
    depth?: number; 
    /**
     * Flag indicating if uncaught exception should be output as human readable, instead of a single line
     */
    humanReadableUnhandledException?: boolean; 
    /**
     * Flag indicating if we should prepend output with level (default true).
     */
    showLevel?: boolean;
    /**
     * Array of strings containing the levels to log to stderr instead of stdout, for example 
     * ['error', 'debug', 'info']. (default ['error', 'debug'])
     */
    stderrLevels?: Array<string>;     
}

export interface LogFileConfig {
    /**
     * The filename of the logfile to write output to.
     */
    filename?: string;
    /**
     * flag indicating if we should prepend output with timestamps (default true). 
     */
    timestamp?: boolean;
    /**
     * Flag indicating whether to suppress output.
     */
    silent?: boolean; 
    /**
     * Flag indicating if we should colorize output.
     */
    colorize?: boolean; 
    /**
     * Max size in bytes of the logfile, if the size is exceeded then a new file is created, 
     * a counter will become a suffix of the log file. 
     */
    maxsize?: number; 
    /**
     * Limit the number of files created when the size of the logfile is exceeded.
     */
    maxFiles?: number;
    /**
     * If true, messages will be logged as JSON (default true).
     */
    json?: boolean;
    /**
     * String indicating the end-of-line characters to use (default to \n).
     */
    eol?: string;
    /**
     * If true, additional JSON metadata objects that are added to logging string 
     * messages will be displayed as a JSON string representation.  
     */
    prettyPrint?: boolean;
    /**
     * Numeric indicating how many times to recurse while formatting the object with util.inspect 
     * (only used with prettyPrint: true) 
     * (default null, unlimited)
     */
    depth?: number; 
    /**
     * If true, messages will be logged as JSON and formatted for logstash (default false).
     */
    logstash?: boolean;
    /**
     * Flag indicating if we should prepend output with level (default true).
     */
    showLevel?: boolean;
    /**
     * If true, log files will be rolled based on maxsize and maxfiles, but in ascending order. 
     * The filename will always have the most recent log lines. The larger the appended number, 
     * the older the log file. 
     * This option requires maxFiles to be set, or it will be ignored.
     */
    tailable?: boolean;
    /**
     * The number of stream creation retry attempts before entering a failed state. 
     * In a failed state the transport stays active but performs a NOOP on it's log function. 
     * (default 2)
     */
    maxRetries?: number;
    /**
     * If true, all log files but the current one will be zipped.
     */
    zippedArchive?: boolean;
}

export enum LogLevel {
    error, info, debug
}

let LogConsoleConfigSchema = Joi.object().keys({
    timestamp: Joi.boolean(),
    silent: Joi.boolean(), 
    colorize: Joi.boolean(), 
    json: Joi.boolean(),
    stringify: Joi.boolean(), 
    prettyPrint: Joi.boolean(),
    depth: Joi.number().positive(), 
    humanReadableUnhandledException: Joi.boolean(), 
    showLevel: Joi.boolean(),
    stderrLevels: Joi.array().items(Joi.string().valid('error', 'info', 'debug')) 
});

let LogFileConfigSchema = Joi.object().keys({
    filename: Joi.string().regex(/^[a-z\.\/][a-zA-Z0-9\.\/]*$/),
    timestamp: Joi.boolean(),
    silent: Joi.boolean(), 
    colorize: Joi.boolean(), 
    maxsize: Joi.number().positive(), 
    maxFiles: Joi.number().positive(),
    json: Joi.boolean(),
    eol: Joi.string(),
    prettyPrint: Joi.boolean(),
    depth: Joi.number().positive(), 
    logstash: Joi.boolean(),
    showLevel: Joi.boolean(),
    tailable: Joi.boolean(),
    maxRetries: Joi.number().positive(),
    zippedArchive: Joi.boolean()    
}).with('depth','prettyPrint').with('tailable', 'maxFiles');

let LoggerConfigSchema = Joi.object().keys({
    level: Joi.string().valid('error', 'info', 'debug'),
    console: LogConsoleConfigSchema,
    file: LogFileConfigSchema
});

let RedisConfigSchema = Joi.object().keys({
    host: Joi.string().hostname().required(),
    port: Joi.number().positive().required(),
    db: Joi.number().positive()
});

let MonitorConfigSchema = Joi.object().keys({
    name: Joi.string().valid('cpu', 'mem').required(),
    statsConfig: StatsConfigValidatorSchema.required()
});

let AccessLoggerConfigSchema = Joi.object().keys({
    msg: Joi.string(),
    expressFormat: Joi.boolean(), 
    colorize: Joi.boolean(),     
    console: LogConsoleConfigSchema,
    file: LogFileConfigSchema,
    disableStats: Joi.boolean()
});

export let GatewayConfigValidatorSchema = Joi.object().keys({
    listenPort: Joi.number().positive().required(),
    adminPort: Joi.number().positive().required(),
    database: RedisConfigSchema.required(),
    rootPath: Joi.string().regex(/^[a-z\.\/][a-zA-Z0-9\.\/]*$/),
    middlewarePath: Joi.string().regex(/^[a-z\.\/][a-zA-Z0-9\.\/]*$/),
    underProxy: Joi.boolean(),
    logger: LoggerConfigSchema,
    accessLogger: AccessLoggerConfigSchema,
    adminLogger: AccessLoggerConfigSchema,
    statsConfig: StatsConfigValidatorSchema,
    monitor: Joi.array().items(MonitorConfigSchema),
    disableAdminStats: Joi.boolean()
});

export function validateGatewayConfig(gatewayConfig: GatewayConfig) {
    return new Promise((resolve, reject) => {
        Joi.validate(gatewayConfig, GatewayConfigValidatorSchema, (err, value) => {
            if (err) {
                reject(err);
            } else {
                resolve(value);
            }
        })
    });
}