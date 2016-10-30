"use strict";

import * as express from "express";
import * as logger from "morgan";
import {Gateway} from "./gateway";
import * as fs from "fs-extra";
import * as winston from "winston";
import {Container, Provider} from "typescript-ioc";
import * as compression from "compression";
import {Settings} from "../lib/settings";
import * as path from "path";
import * as StringUtils from "underscore.string";

let rootDir = __dirname;

if (process.argv.length > 2) {
  rootDir = process.argv[2];
  if (StringUtils.startsWith(rootDir, '.')) {
    rootDir = path.join(process.cwd(), rootDir);                
  }
  const provider: Provider = { 
    get: () => {
      const settings: Settings = new Settings();
      settings.app = express();
      settings.apiPath = path.join(rootDir, 'apis');
      settings.middlewarePath = path.join(rootDir ,'middleware');
        return settings; 
    }
  };

  Container.bind(Settings).provider(provider)
}
winston.add(winston.transports.File, { filename: path.join(rootDir, 'logs/gateway.log') });
let gateway: Gateway = Container.get(Gateway);
let app = gateway.server;
app.disable('x-powered-by'); 
app.use(compression());
//app.enable('trust proxy'); // If we are behind a reverse proxy (Heroku, Bluemix, AWS if you use an ELB, custom Nginx setup, etc) 


if (app.get('env') == 'production') {
  const accessLogStream = fs.createWriteStream(path.join(rootDir, 'logs/access_errors.log'),{flags: 'a'});
  app.use(logger('common', {
    skip: function(req: express.Request, res: express.Response) { 
        return res.statusCode < 400 
    }, 
    stream: accessLogStream }));
} 
else {
  app.use(logger('dev'));
}

gateway.initialize();
app.listen(3010);
module.exports = app;

