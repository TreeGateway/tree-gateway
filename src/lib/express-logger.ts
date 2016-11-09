"use strict";

import * as express from "express";
import * as Winston from "winston";
import {AccessLoggerConfig} from "./config/gateway";
import * as StringUtils from "underscore.string";
import * as path from "path";
import * as fs from "fs-extra";
import {Gateway} from "./gateway";
import * as Utils from "underscore";

let defaults = require('defaults');
let expressWinston = require('express-winston');

export class AccessLogger {
    static configureAccessLoger(config: AccessLoggerConfig, gateway: Gateway, 
                                server: express.Application, defaultFileName: string) {
        config = defaults(config, {
            meta: false
        })
        const options = Utils.omit(config, "console", "file");
        options.transports = [];
        
        if (config && config.console) {
            options.transports.push(new Winston.transports.Console(config.console));
        }
        if (config && config.file) {
            config.file = defaults(config.file, {
                filename: defaultFileName
            })
            if (StringUtils.startsWith(config.file.filename, '.')) {
                config.file.filename = path.join(gateway.config.rootPath, config.file.filename);
            }
            fs.ensureDirSync(path.dirname(config.file.filename));
            options.transports.push(new Winston.transports.File(config.file));
        }
        
        server.use(expressWinston.logger(options));
    }
}
