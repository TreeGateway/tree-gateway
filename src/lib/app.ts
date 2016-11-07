"use strict";

import * as express from "express";
import * as logger from "morgan";
import {Gateway} from "./gateway";
import * as fs from "fs-extra";
import * as compression from "compression";
import {Parameters} from "./command-line";
import {APIService} from "./admin/admin-server";
import * as path from "path";
import {Server} from "typescript-rest";
import {GatewayConfig} from "./config/gateway";

let defaults = require('defaults');

fs.readJson(path.join(Parameters.rootDir,'tree-gateway.json'), (error, gatewayConfig: GatewayConfig)=>{
    if (error) {
        console.error("Error reading tree-gateway.json config file: "+error);
    }
    else {
      gatewayConfig =  defaults(gatewayConfig, {
          rootPath : Parameters.rootDir,
          apiPath : path.join(Parameters.rootDir +'/apis'),
          middlewarePath : path.join(Parameters.rootDir +'/middleware')
      });

      let app = express();
      let gateway: Gateway = new Gateway(app, gatewayConfig);
      configureGatewayServer(gateway);
      module.exports = app;

      configureAdminServer();
    }

});

function configureGatewayServer(gateway) {
  gateway.server.disable('x-powered-by'); 
  gateway.server.use(compression());
  //app.enable('trust proxy'); // If we are behind a reverse proxy (Heroku, Bluemix, AWS if you use an ELB, custom Nginx setup, etc) 


  if (gateway.server.get('env') == 'production') {
    const accessLogStream = fs.createWriteStream(path.join(Parameters.rootDir, 'logs/access_errors.log'),{flags: 'a'});
    gateway.server.use(logger('common', {
      skip: function(req: express.Request, res: express.Response) { 
          return res.statusCode < 400 
      }, 
      stream: accessLogStream }));
  } 
  else {
    gateway.server.use(logger('dev'));
  }
  gateway.initialize();
  gateway.server.listen(Parameters.port, ()=>{
    gateway.logger.info('Gateway listenning on port %d', Parameters.port);
  });
}

function configureAdminServer() {
  let adminServer = express();
  adminServer.disable('x-powered-by'); 
  adminServer.use(compression());
  adminServer.use(logger('dev'));

  Server.buildServices(adminServer, APIService);
  adminServer.listen(Parameters.adminPort, ()=>{
    // winston.info('Gateway Admin API listenning on port %d', Parameters.adminPort);
  });
  return adminServer;
}
