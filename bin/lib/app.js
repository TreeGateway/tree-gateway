"use strict";
var express = require("express");
var logger = require("morgan");
var gateway_1 = require("./gateway");
var fs = require("fs-extra");
var compression = require("compression");
var command_line_1 = require("./command-line");
var admin_server_1 = require("./admin/admin-server");
var path = require("path");
var typescript_rest_1 = require("typescript-rest");
var defaults = require('defaults');
fs.readJson(path.join(command_line_1.Parameters.rootDir, 'tree-gateway.json'), function (error, gatewayConfig) {
    if (error) {
        console.error("Error reading tree-gateway.json config file: " + error);
    }
    else {
        gatewayConfig = defaults(gatewayConfig, {
            rootPath: command_line_1.Parameters.rootDir,
            apiPath: path.join(command_line_1.Parameters.rootDir + '/apis'),
            middlewarePath: path.join(command_line_1.Parameters.rootDir + '/middleware')
        });
        var app = express();
        var gateway = new gateway_1.Gateway(app, gatewayConfig);
        configureGatewayServer(gateway);
        module.exports = app;
        configureAdminServer();
    }
});
function configureGatewayServer(gateway) {
    gateway.server.disable('x-powered-by');
    gateway.server.use(compression());
    if (gateway.server.get('env') == 'production') {
        var accessLogStream = fs.createWriteStream(path.join(command_line_1.Parameters.rootDir, 'logs/access_errors.log'), { flags: 'a' });
        gateway.server.use(logger('common', {
            skip: function (req, res) {
                return res.statusCode < 400;
            },
            stream: accessLogStream }));
    }
    else {
        gateway.server.use(logger('dev'));
    }
    gateway.initialize();
    gateway.server.listen(command_line_1.Parameters.port, function () {
        gateway.logger.info('Gateway listenning on port %d', command_line_1.Parameters.port);
    });
}
function configureAdminServer() {
    var adminServer = express();
    adminServer.disable('x-powered-by');
    adminServer.use(compression());
    adminServer.use(logger('dev'));
    typescript_rest_1.Server.buildServices(adminServer, admin_server_1.APIService);
    adminServer.listen(command_line_1.Parameters.adminPort, function () {
    });
    return adminServer;
}

//# sourceMappingURL=app.js.map
