"use strict";
var fs = require("fs-extra");
var StringUtils = require("underscore.string");
var proxy_1 = require("./proxy/proxy");
var Utils = require("./proxy/utils");
var throttling_1 = require("./throttling/throttling");
var auth_1 = require("./authentication/auth");
var es5_compat_1 = require("./es5-compat");
var logger_1 = require("./logger");
var dbConfig = require("./redis");
var path = require("path");
var defaults = require('defaults');
var Gateway = (function () {
    function Gateway(app, gatewayConfig) {
        this._config = defaults(gatewayConfig, {
            rootPath: __dirname,
            apiPath: path.join(__dirname + '/apis'),
            middlewarePath: path.join(__dirname + '/middleware')
        });
        this.app = app;
        this._logger = new logger_1.Logger(this.config.logger, this);
        if (this.config.database) {
            this._redisClient = dbConfig.initializeRedis(this.config.database);
        }
        this.apiProxy = new proxy_1.ApiProxy(this);
        this.apiRateLimit = new throttling_1.ApiRateLimit(this);
        this.apiAuth = new auth_1.ApiAuth(this);
    }
    Object.defineProperty(Gateway.prototype, "server", {
        get: function () {
            return this.app;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Gateway.prototype, "logger", {
        get: function () {
            return this._logger;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Gateway.prototype, "config", {
        get: function () {
            return this._config;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Gateway.prototype, "redisClient", {
        get: function () {
            return this._redisClient;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Gateway.prototype, "apiPath", {
        get: function () {
            return this.config.apiPath;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Gateway.prototype, "middlewarePath", {
        get: function () {
            return this.config.middlewarePath;
        },
        enumerable: true,
        configurable: true
    });
    Gateway.prototype.initialize = function (ready) {
        var _this = this;
        this.apis = new es5_compat_1.StringMap();
        var path = this.apiPath;
        fs.readdir(path, function (err, files) {
            if (err) {
                _this._logger.error("Error reading directory: " + err);
            }
            else {
                path = ((StringUtils.endsWith(path, '/')) ? path : path + '/');
                var length_1 = files.length;
                files.forEach(function (fileName, index) {
                    if (StringUtils.endsWith(fileName, '.json')) {
                        fs.readJson(path + fileName, function (error, apiConfig) {
                            if (error) {
                                _this._logger.error("Error reading directory: " + error);
                            }
                            else {
                                _this.loadApi(apiConfig, (length_1 - 1 === index) ? ready : null);
                            }
                        });
                    }
                });
            }
        });
    };
    Gateway.prototype.loadApi = function (api, ready) {
        if (this._logger.isInfoEnabled()) {
            this._logger.info("Configuring API [%s] on path: %s", api.name, api.proxy.path);
        }
        var apiKey = this.getApiKey(api);
        this.apis.set(apiKey, api);
        api.proxy.path = Utils.normalizePath(api.proxy.path);
        if (api.throttling) {
            if (this._logger.isDebugEnabled()) {
                this._logger.debug("Configuring API Rate Limits");
            }
            this.apiRateLimit.throttling(api.proxy.path, api.throttling);
        }
        if (api.authentication) {
            if (this._logger.isDebugEnabled()) {
                this._logger.debug("Configuring API Authentication");
            }
            this.apiAuth.authentication(apiKey, api.proxy.path, api.authentication);
        }
        if (this._logger.isDebugEnabled()) {
            this._logger.debug("Configuring API Proxy");
        }
        this.apiProxy.proxy(api);
        if (ready) {
            ready();
        }
    };
    Gateway.prototype.getApiKey = function (api) {
        return api.name + (api.version ? '_' + api.version : '_default');
    };
    return Gateway;
}());
exports.Gateway = Gateway;

//# sourceMappingURL=gateway.js.map
