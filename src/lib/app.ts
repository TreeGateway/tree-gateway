"use strict";

import * as express from "express";
import * as logger from "morgan";
import {Gateway} from "./gateway";
import * as fs from "fs-extra";
import * as winston from "winston";

winston.add(winston.transports.File, { filename: __dirname + '/logs/gateway.log' });
let gateway: Gateway = new Gateway();
let app = gateway.server;

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

gateway.configure(__dirname +'/apis');
app.listen(3010);
module.exports = app;

