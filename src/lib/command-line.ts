"use strict";

import * as express from "express";
import * as Winston from "winston";
import {Settings} from "../lib/settings";
import * as path from "path";
import * as StringUtils from "underscore.string";
import {Container, Provider} from "typescript-ioc";
import * as redis from "ioredis";

let args = require("args");

let parameters = args
  .option('dir', 'The root directory where apis and middlewares are placed.', __dirname)
  .option('port', 'The gateway listen port.', 8000)
  .option('adminPort', 'The gateway admin server listen port.', 8001)
  .parse(process.argv);

export class Parameters {
    static rootDir: string;
    static port: number;
    static adminPort: number;
}

Parameters.rootDir = parameters.dir;
Parameters.port = parameters.port;
Parameters.adminPort = parameters.adminPort;

if (StringUtils.startsWith(Parameters.rootDir, '.')) {
  Parameters.rootDir = path.join(process.cwd(), Parameters.rootDir);                
}
const provider: Provider = { 
  get: () => {
    const settings: Settings = new Settings();
    settings.app = express();
    settings.redisClient = new redis(6379, 'localhost');
    settings.apiPath = path.join(Parameters.rootDir, 'apis');
    settings.middlewarePath = path.join(Parameters.rootDir ,'middleware');
    settings.logger = new Winston.Logger({
        level: (process.env.NODE_ENV === 'production')?'error':'debug',
        transports: [
            new Winston.transports.Console({
                colorize: true
            }),
            new Winston.transports.File({
              filename: path.join(Parameters.rootDir, 'logs/gateway.log'),
              timestamp: true
            })
        ]          
      });

      return settings; 
  }
};

Container.bind(Settings).provider(provider);
