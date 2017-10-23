'use strict';

import * as Joi from 'joi';

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
    console?: LogConsoleConfig;
    file?: LogFileConfig;
}

export interface LoggerConfig {
    /**
     * Level of messages that this logger should log.
     */
    level?: string;
    /**
     * Configure a Console reporter for the log system.
     */
    console?: LogConsoleConfig;
    /**
     * Configure a File reporter for the log system.
     */
    file?: LogFileConfig;
}

export interface LogConsoleConfig {
    /**
     * Level of messages that this logger should log.
     */
    level?: string;
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
     * ['error', 'warn', 'debug', 'info']. (default ['error', 'debug'])
     */
    stderrLevels?: Array<string>;
}

export interface LogFileConfig {
    /**
     * Level of messages that this logger should log.
     */
    level?: string;
    /**
     * The directory name where the logfiles will be saved.
     */
    outputDir?: string;
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
    error, warn, info, debug
}

const logConsoleConfigSchema = Joi.object().keys({
    colorize: Joi.boolean(),
    depth: Joi.number().positive(),
    humanReadableUnhandledException: Joi.boolean(),
    json: Joi.boolean(),
    level: Joi.string().valid('error', 'warn', 'info', 'debug'),
    prettyPrint: Joi.boolean(),
    showLevel: Joi.boolean(),
    silent: Joi.boolean(),
    stderrLevels: Joi.array().items(Joi.string().valid('error', 'warn', 'info', 'debug')),
    stringify: Joi.boolean(),
    timestamp: Joi.boolean()
});

const logFileConfigSchema = Joi.object().keys({
    colorize: Joi.boolean(),
    depth: Joi.number().positive(),
    eol: Joi.string(),
    json: Joi.boolean(),
    level: Joi.string().valid('error', 'warn', 'info', 'debug'),
    logstash: Joi.boolean(),
    maxFiles: Joi.number().positive(),
    maxRetries: Joi.number().positive(),
    maxsize: Joi.number().positive(),
    outputDir: Joi.string().regex(/^[a-z\.\/][a-zA-Z0-9\.\/]*$/),
    prettyPrint: Joi.boolean(),
    showLevel: Joi.boolean(),
    silent: Joi.boolean(),
    tailable: Joi.boolean(),
    timestamp: Joi.boolean(),
    zippedArchive: Joi.boolean()
}).with('depth', 'prettyPrint').with('tailable', 'maxFiles');

export let loggerConfigSchema = Joi.object().keys({
    console: logConsoleConfigSchema,
    file: logFileConfigSchema,
    level: Joi.string().valid('error', 'warn', 'info', 'debug')
});

export let accessLoggerConfigSchema = Joi.object().keys({
    console: logConsoleConfigSchema,
    expressFormat: Joi.boolean(),
    file: logFileConfigSchema,
    msg: Joi.string()
});
