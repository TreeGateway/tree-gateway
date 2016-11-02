"use strict";

import * as express from "express";
import * as winston from "winston";
import {Settings} from "../lib/settings";
import * as path from "path";
import * as StringUtils from "underscore.string";
import {Container, Provider} from "typescript-ioc";

let args = require("args");

let parameters = args
  .option('dir', 'The root directory where apis and middlewares are placed.', __dirname)
  .option('port', 'The gateway listen port.', 8000)
  .parse(process.argv);

export class Parameters {
    static rootDir: string;
    static port: number;
}

Parameters.rootDir = parameters.dir;
Parameters.port = parameters.port;

if (StringUtils.startsWith(Parameters.rootDir, '.')) {
  Parameters.rootDir = path.join(process.cwd(), Parameters.rootDir);                
}
const provider: Provider = { 
  get: () => {
    const settings: Settings = new Settings();
    settings.app = express();
    settings.apiPath = path.join(Parameters.rootDir, 'apis');
    settings.middlewarePath = path.join(Parameters.rootDir ,'middleware');
      return settings; 
  }
};

Container.bind(Settings).provider(provider);
winston.add(winston.transports.File, { filename: path.join(Parameters.rootDir, 'logs/gateway.log') });
