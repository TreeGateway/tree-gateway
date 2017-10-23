'use strict';

import * as Winston from 'winston';
import { LoggerConfig, LogLevel } from './config/logger';
import * as _ from 'lodash';
import * as path from 'path';
import * as fs from 'fs-extra-promise';
import { AutoWired, Singleton, Inject } from 'typescript-ioc';
import { Configuration } from './configuration';
import { inspect } from 'util';

@Singleton
@AutoWired
export class Logger {
    level: LogLevel;
    winston: Winston.LoggerInstance;
    @Inject private config: Configuration;

    constructor() {
        this.winston = this.instantiateLogger(this.config.gateway.logger);
        this.config.on('gateway-update', (gateway: any) => {
            if (this.winston && this.isDebugEnabled()) {
                this.debug('The system logger is restarting...');
            }
            this.winston = this.instantiateLogger(gateway.logger);
        });
    }

    private instantiateLogger(config: LoggerConfig) {
        this.level = (config ? (<any>LogLevel)[config.level] : LogLevel.info);
        const options: Winston.LoggerOptions = {
            level: LogLevel[this.level],
            transports: []
        };

        if (config && config.console) {
            options.transports.push(new Winston.transports.Console(config.console));
        }
        if (config && config.file) {
            config.file = _.omit(config.file, 'outputDir');
            let outputDir: string = config.file.outputDir || './logs';
            if (_.startsWith(outputDir, '.')) {
                outputDir = path.join(this.config.rootPath, outputDir);
            }
            const fileName = (process.env.processNumber ? `gateway-${process.env.processNumber}.log` : `gateway.log`);
            (<any>config).file['filename'] = path.join(outputDir, fileName);
            fs.ensureDirSync(path.dirname((<any>config).file['filename']));
            options.transports.push(new Winston.transports.File(config.file));
        }

        return new Winston.Logger(options);
    }

    isDebugEnabled(): boolean {
        return this.level === LogLevel.debug;
    }

    isInfoEnabled(): boolean {
        return this.level >= LogLevel.info;
    }

    isWarnEnabled(): boolean {
        return this.level >= LogLevel.warn;
    }

    isErrorEnabled(): boolean {
        return this.level >= LogLevel.error;
    }

    debug(...args: any[]) {
        this.winston.debug.apply(this, arguments);
    }

    info(...args: any[]) {
        this.winston.info.apply(this, arguments);
    }

    warn(...args: any[]) {
        this.winston.warn.apply(this, arguments);
    }

    error(...args: any[]) {
        this.winston.error.apply(this, arguments);
    }

    inspectObject(object: any) {
        inspect(object, { colors: true, depth: 15 });
    }
}
