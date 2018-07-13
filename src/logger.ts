'use strict';

import * as fs from 'fs-extra-promise';
import * as _ from 'lodash';
import * as path from 'path';
import { AutoWired, Inject, Singleton } from 'typescript-ioc';
import { inspect } from 'util';
import * as Winston from 'winston';
import { LoggerConfig, LogLevel } from './config/logger';
import { Configuration } from './configuration';

@Singleton
@AutoWired
export class Logger {
    public level: LogLevel;
    public winston: Winston.LoggerInstance;
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

    public isDebugEnabled(): boolean {
        return this.level === LogLevel.debug;
    }

    public isInfoEnabled(): boolean {
        return this.level >= LogLevel.info;
    }

    public isWarnEnabled(): boolean {
        return this.level >= LogLevel.warn;
    }

    public isErrorEnabled(): boolean {
        return this.level >= LogLevel.error;
    }

    public debug(...args: Array<any>) {
        this.winston.debug.apply(this, arguments);
    }

    public info(...args: Array<any>) {
        this.winston.info.apply(this, arguments);
    }

    public warn(...args: Array<any>) {
        this.winston.warn.apply(this, arguments);
    }

    public error(...args: Array<any>) {
        this.winston.error.apply(this, arguments);
    }

    public inspectObject(object: any) {
        inspect(object, { colors: true, depth: 15 });
    }

    private instantiateLogger(config: LoggerConfig) {
        this.level = (config ? (LogLevel as any)[config.level] : LogLevel.info);
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
            (config as any).file['filename'] = path.join(outputDir, fileName);
            fs.ensureDirSync(path.dirname((config as any).file['filename']));
            options.transports.push(new Winston.transports.File(config.file));
        }

        return new Winston.Logger(options);
    }
}
