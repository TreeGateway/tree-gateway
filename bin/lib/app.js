"use strict";
var express = require("express");
var logger = require("morgan");
var gateway_1 = require("./gateway");
var fs = require("fs-extra");
var winston = require("winston");
var typescript_ioc_1 = require("typescript-ioc");
var compression = require("compression");
var settings_1 = require("../lib/settings");
var path = require("path");
var StringUtils = require("underscore.string");
var rootDir = __dirname;
if (process.argv.length > 2) {
    rootDir = process.argv[2];
    if (StringUtils.startsWith(rootDir, '.')) {
        rootDir = path.join(process.cwd(), rootDir);
    }
    var provider = {
        get: function () {
            var settings = new settings_1.Settings();
            settings.app = express();
            settings.apiPath = path.join(rootDir, 'apis');
            settings.middlewarePath = path.join(rootDir, 'middleware');
            return settings;
        }
    };
    typescript_ioc_1.Container.bind(settings_1.Settings).provider(provider);
}
winston.add(winston.transports.File, { filename: path.join(rootDir, 'logs/gateway.log') });
var gateway = typescript_ioc_1.Container.get(gateway_1.Gateway);
var app = gateway.server;
app.disable('x-powered-by');
app.use(compression());
if (app.get('env') == 'production') {
    var accessLogStream = fs.createWriteStream(path.join(rootDir, 'logs/access_errors.log'), { flags: 'a' });
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
app.listen(3010);
module.exports = app;

//# sourceMappingURL=app.js.map
