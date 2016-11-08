"use strict";

import * as Winston from "winston";
import {LoggerConfig, LogLevel} from "./config/gateway";
import * as StringUtils from "underscore.string";
import * as path from "path";
import * as fs from "fs-extra";
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
                filename: './logs/gateway.log'
            })
            if (StringUtils.startsWith(config.file.filename, '.')) {
                config.file.filename = path.join(gateway.config.rootPath, config.file.filename);
                fs.ensureDirSync(path.dirname(config.file.filename));
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

    debug(...args: any[]) {
        this.winston.debug.apply(this, arguments);
    }

    info(...args: any[]) {
        this.winston.info.apply(this, arguments);
    }

    error(...args: any[]) {
        this.winston.error.apply(this, arguments);
    }
}
