"use strict";

import * as Winston from "winston";
import {LoggerConfig, LogLevel} from "./config/gateway";
import * as StringUtils from "underscore.string";
import * as path from "path";
import {Gateway} from "./gateway";

let defaults = require('defaults');

export class Logger {
    level: LogLevel;
    winston: Winston.LoggerInstance;
    config: LoggerConfig;

    constructor(config: LoggerConfig, gateway: Gateway) {
        this.config = config;
        this.winston = this.instantiateLogger(config, gateway);
    }

    private instantiateLogger(config: LoggerConfig, gateway: Gateway) {
        this.level = (config? LogLevel[config.level] : LogLevel.info);
        const options: Winston.LoggerOptions = {
           level: LogLevel[this.level],
           transports: [] 
        }
        
        if (config && config.console) {
            options.transports.push(new Winston.transports.Console(config.console));
        }
        if (config && config.file) {
            config.file = defaults(config.file, {
                filename: path.join(__dirname, 'logs/gateway.log')
            })
            if (StringUtils.startsWith(config.file.filename, '.')) {
            config.file.filename = path.join(gateway.config.rootPath, config.file.filename);                
            }
            options.transports.push(new Winston.transports.File(config.file));
        }
        
        return new Winston.Logger(options);
    }

    isDebugEnabled (): boolean {
        return this.level === LogLevel.debug;
    }

    isInfoEnabled (): boolean {
        return this.level >= LogLevel.info;
    }

    isErrorEnabled (): boolean {
        return this.level >= LogLevel.error;
    }

    debug(msg: string, ...meta:any[]) {
        this.winston.debug(msg, meta);
    }

    info(msg: string, ...meta:any[]) {
        this.winston.info(msg, meta);
    }

    error(msg: string, ...meta:any[]) {
        this.winston.error(msg, meta);
    }
}
