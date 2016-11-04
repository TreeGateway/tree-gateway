"use strict";
var express = require("express");
var winston = require("winston");
var settings_1 = require("../lib/settings");
var path = require("path");
var StringUtils = require("underscore.string");
var typescript_ioc_1 = require("typescript-ioc");
var redis = require("ioredis");
var args = require("args");
var parameters = args
    .option('dir', 'The root directory where apis and middlewares are placed.', __dirname)
    .option('port', 'The gateway listen port.', 8000)
    .option('adminPort', 'The gateway admin server listen port.', 8001)
    .parse(process.argv);
var Parameters = (function () {
    function Parameters() {
    }
    return Parameters;
}());
exports.Parameters = Parameters;
Parameters.rootDir = parameters.dir;
Parameters.port = parameters.port;
Parameters.adminPort = parameters.adminPort;
if (StringUtils.startsWith(Parameters.rootDir, '.')) {
    Parameters.rootDir = path.join(process.cwd(), Parameters.rootDir);
}
var provider = {
    get: function () {
        var settings = new settings_1.Settings();
        settings.app = express();
        settings.redisClient = new redis(6379, 'localhost');
        settings.apiPath = path.join(Parameters.rootDir, 'apis');
        settings.middlewarePath = path.join(Parameters.rootDir, 'middleware');
        return settings;
    }
};
typescript_ioc_1.Container.bind(settings_1.Settings).provider(provider);
winston.add(winston.transports.File, { filename: path.join(Parameters.rootDir, 'logs/gateway.log') });

//# sourceMappingURL=command-line.js.map
