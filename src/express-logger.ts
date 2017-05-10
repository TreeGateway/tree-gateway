'use strict';

import * as express from 'express';
import * as Winston from 'winston';
import { AccessLoggerConfig } from './config/logger';
import * as path from 'path';
import * as fs from 'fs-extra-promise';
import * as _ from 'lodash';

const expressWinston = require('express-winston');

export class AccessLogger {
    static configureAccessLoger(config: AccessLoggerConfig, rootPath: string,
        server: express.Application, defaultDir: string) {
        config = _.defaults(config, {
            meta: false,
            statusLevels: true
        });
        const options: any = _.omit(config, 'console', 'file');
        options.transports = [];

        if (config && config.console) {
            options.transports.push(new Winston.transports.Console(config.console));
        }
        if (config && config.file) {
            config.file = _.omit(config.file, 'outputDir');
            let outputDir: string = config.file.outputDir || defaultDir;
            if (_.startsWith(outputDir, '.')) {
                outputDir = path.join(rootPath, outputDir);
            }
            const fileName = (process.env.processNumber ? `access-${process.env.processNumber}.log` : `access.log`);
            (<any>config).file['filename'] = path.join(outputDir, fileName);
            fs.ensureDirSync(path.dirname((<any>config).file['filename']));
            options.transports.push(new Winston.transports.File(config.file));
        }
        server.use(expressWinston.logger(options));
    }
}
