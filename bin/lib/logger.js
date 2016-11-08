"use strict";
var Winston = require("winston");
var gateway_1 = require("./config/gateway");
var StringUtils = require("underscore.string");
var path = require("path");
var fs = require("fs-extra");
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
                filename: './logs/gateway.log'
            });
            if (StringUtils.startsWith(config.file.filename, '.')) {
                config.file.filename = path.join(gateway.config.rootPath, config.file.filename);
                fs.ensureDirSync(path.dirname(config.file.filename));
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
    Logger.prototype.debug = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        this.winston.debug.apply(this, arguments);
    };
    Logger.prototype.info = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        this.winston.info.apply(this, arguments);
    };
    Logger.prototype.error = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        this.winston.error.apply(this, arguments);
    };
    return Logger;
}());
exports.Logger = Logger;

//# sourceMappingURL=logger.js.map
