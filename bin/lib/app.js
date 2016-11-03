"use strict";
var express = require("express");
var logger = require("morgan");
var gateway_1 = require("./gateway");
var fs = require("fs-extra");
var winston = require("winston");
var typescript_ioc_1 = require("typescript-ioc");
var compression = require("compression");
var command_line_1 = require("./command-line");
var admin_server_1 = require("./admin/admin-server");
var path = require("path");
var typescript_rest_1 = require("typescript-rest");
var gateway = typescript_ioc_1.Container.get(gateway_1.Gateway);
var app = configureGatewayServer();
module.exports = app;
configureAdminServer();
function configureGatewayServer() {
    var app = gateway.server;
    app.disable('x-powered-by');
    app.use(compression());
    if (app.get('env') == 'production') {
        var accessLogStream = fs.createWriteStream(path.join(command_line_1.Parameters.rootDir, 'logs/access_errors.log'), { flags: 'a' });
        app.use(logger('common', {
            skip: function (req, res) {
                return res.statusCode < 400;
            },
            stream: accessLogStream }));
    }
    else {
        app.use(logger('dev'));
    }
    gateway.initialize();
    app.listen(command_line_1.Parameters.port, function () {
        winston.info('Gateway listenning on port %d', command_line_1.Parameters.port);
    });
    return app;
}
function configureAdminServer() {
    var adminServer = express();
    adminServer.disable('x-powered-by');
    adminServer.use(compression());
    adminServer.use(logger('dev'));
    typescript_rest_1.Server.buildServices(adminServer, admin_server_1.APIService);
    adminServer.listen(command_line_1.Parameters.adminPort, function () {
        winston.info('Gateway Admin API listenning on port %d', command_line_1.Parameters.adminPort);
    });
    return adminServer;
}

//# sourceMappingURL=app.js.map
