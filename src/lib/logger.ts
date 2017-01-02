"use strict";

import * as Winston from "winston";
import {LoggerConfig, LogLevel} from "./config/gateway";
import * as _ from "lodash";
import * as path from "path";
import * as fs from "fs-extra-promise";
import {Gateway} from "./gateway";

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
            config.file = _.omit(config.file, 'outputDir');
            let outputDir: string = config.file.outputDir || './logs';
            if (_.startsWith(outputDir, '.')) {
                outputDir = path.join(gateway.config.rootPath, outputDir);
            }
            const fileName = (process.env.processNumber?`gateway-${process.env.processNumber}.log`:`gateway.log`)
            config.file['filename'] = path.join(outputDir, fileName);
            fs.ensureDirSync(path.dirname(config.file['filename']));
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
