"use strict";
var Winston = require("winston");
var gateway_1 = require("./config/gateway");
var StringUtils = require("underscore.string");
var path = require("path");
var defaults = require('defaults');
var Logger = (function () {
    function Logger(config, gateway) {
        this.config = config;
        this.winston = this.instantiateLogger(config, gateway);
    }
    Logger.prototype.instantiateLogger = function (config, gateway) {
        this.level = (config ? gateway_1.LogLevel[config.level] : gateway_1.LogLevel.info);
        var options = {
            level: gateway_1.LogLevel[this.level],
            transports: []
        };
        if (config && config.console) {
            options.transports.push(new Winston.transports.Console(config.console));
        }
        if (config && config.file) {
            config.file = defaults(config.file, {
                filename: path.join(__dirname, 'logs/gateway.log')
            });
            if (StringUtils.startsWith(config.file.filename, '.')) {
                config.file.filename = path.join(gateway.config.rootPath, config.file.filename);
            }
            options.transports.push(new Winston.transports.File(config.file));
        }
        return new Winston.Logger(options);
    };
    Logger.prototype.isDebugEnabled = function () {
        return this.level === gateway_1.LogLevel.debug;
    };
    Logger.prototype.isInfoEnabled = function () {
        return this.level >= gateway_1.LogLevel.info;
    };
    Logger.prototype.isErrorEnabled = function () {
        return this.level >= gateway_1.LogLevel.error;
    };
    Logger.prototype.debug = function (msg) {
        var meta = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            meta[_i - 1] = arguments[_i];
        }
        this.winston.debug(msg, meta);
    };
    Logger.prototype.info = function (msg) {
        var meta = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            meta[_i - 1] = arguments[_i];
        }
        this.winston.info(msg, meta);
    };
    Logger.prototype.error = function (msg) {
        var meta = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            meta[_i - 1] = arguments[_i];
        }
        this.winston.error(msg, meta);
    };
    return Logger;
}());
exports.Logger = Logger;

//# sourceMappingURL=logger.js.map
