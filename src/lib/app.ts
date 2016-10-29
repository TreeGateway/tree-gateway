"use strict";

import * as express from "express";
import * as logger from "morgan";
import {Gateway} from "./gateway";
import * as fs from "fs-extra";
import * as winston from "winston";
import {Container} from "typescript-ioc";
import * as compression from "compression";

winston.add(winston.transports.File, { filename: __dirname + '/logs/gateway.log' });
let gateway: Gateway = Container.get(Gateway);
let app = gateway.server;
app.use(compression());
//app.enable('trust proxy'); // If we are behind a reverse proxy (Heroku, Bluemix, AWS if you use an ELB, custom Nginx setup, etc) 

if (app.get('env') == 'production') {
  const accessLogStream = fs.createWriteStream(__dirname + '/logs/access_errors.log',{flags: 'a'});
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

