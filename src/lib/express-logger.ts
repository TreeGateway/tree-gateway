"use strict";

import * as express from "express";
import * as Winston from "winston";
import {AccessLoggerConfig} from "./config/gateway";
import * as path from "path";
import * as fs from "fs-extra-promise";
import {Gateway} from "./gateway";
import * as _ from "lodash";

let expressWinston = require('express-winston');

export class AccessLogger {
    static configureAccessLoger(config: AccessLoggerConfig, gateway: Gateway, 
                                server: express.Application, defaultFileName: string) {
        config = _.defaults(config, {
            meta: false, 
            statusLevels: true
        })
        const options: any = _.omit(config, "console", "file");
        options.transports = [];
        
        if (config && config.console) {
            options.transports.push(new Winston.transports.Console(config.console));
        }
        if (config && config.file) {
            config.file = _.defaults(config.file, {
                filename: defaultFileName
            })
            if (_.startsWith(config.file.filename, '.')) {
                config.file.filename = path.join(gateway.config.rootPath, config.file.filename);
            }
            fs.ensureDirSync(path.dirname(config.file.filename));
            options.transports.push(new Winston.transports.File(config.file));
        }
        server.use(expressWinston.logger(options));
    }
}
