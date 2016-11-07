"use strict";

/**
 * The API config descriptor.
 */
export interface GatewayConfig {
    /**
     * The gateway port
     */
    listenPort: string;
    /**
     * The gateway admin server port
     */
    adminPort: string;
    /**
     * The root folder where the gateway will work.
     */
    rootPath: string;
    /**
     * Folder where the gateway will search for installed APIs.
     */
    apiPath: string;
    /**
     * Folder where the gateway will search for its middleware functions.
     */
    middlewarePath: string;
    /**
     * If we are behind a reverse proxy (Heroku, Bluemix, AWS if you use an ELB, custom Nginx setup, etc)
     */
    underProxy?: boolean;
    /**
     * Configurations for gateway logger.
     */
    logger?: LoggerConfig;
    /**
     * Configurations for gateway database (REDIS).
     */
    database?: RedisConfig;
    /**
     * Configurations for gateway logger.
     */
    accessLogger?: AccessLoggerConfig;

}

export interface AccessLoggerConfig {

}

export interface RedisConfig {
    host: string;
    port: number;
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