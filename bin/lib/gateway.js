"use strict";
var logger = require("morgan");
var compression = require("compression");
var express = require("express");
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
    function Gateway(gatewayConfigFile) {
        this.configFile = gatewayConfigFile;
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
    Gateway.prototype.start = function (ready) {
        var _this = this;
        this.initialize(this.configFile, function () {
            _this.apiServer = _this.app.listen(_this.config.listenPort, function () {
                _this.logger.info('Gateway listenning on port %d', _this.config.listenPort);
                if (ready) {
                    ready();
                }
            });
        });
    };
    Gateway.prototype.startAdmin = function (ready) {
        var _this = this;
        if (this.adminApp) {
            this.adminServer = this.adminApp.listen(this.config.adminPort, function () {
                _this.logger.info('Gateway Admin Server listenning on port %d', _this.config.adminPort);
                if (ready) {
                    ready();
                }
            });
        }
        else {
            console.error("You must start the Tree-Gateway before.");
        }
    };
    Gateway.prototype.stop = function () {
        if (this.apiServer) {
            this.apiServer.close();
            this.apiServer = null;
        }
    };
    Gateway.prototype.stopAdmin = function () {
        if (this.adminServer) {
            this.adminServer.close();
            this.adminServer = null;
        }
    };
    Gateway.prototype.loadApis = function (ready) {
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
    Gateway.prototype.initialize = function (configFileName, ready) {
        var _this = this;
        if (StringUtils.startsWith(configFileName, '.')) {
            configFileName = path.join(process.cwd(), configFileName);
        }
        fs.readJson(configFileName, function (error, gatewayConfig) {
            if (error) {
                console.error("Error reading tree-gateway.json config file: " + error);
            }
            else {
                _this.app = express();
                _this._config = defaults(gatewayConfig, {
                    rootPath: path.dirname(configFileName),
                });
                if (StringUtils.startsWith(_this._config.rootPath, '.')) {
                    _this._config.rootPath = path.join(path.dirname(configFileName), _this._config.rootPath);
                }
                _this._config = defaults(_this._config, {
                    apiPath: path.join(_this._config.rootPath, 'apis'),
                    middlewarePath: path.join(_this._config.rootPath, 'middleware')
                });
                if (StringUtils.startsWith(_this._config.apiPath, '.')) {
                    _this._config.apiPath = path.join(_this._config.rootPath, _this._config.apiPath);
                }
                if (StringUtils.startsWith(_this._config.middlewarePath, '.')) {
                    _this._config.middlewarePath = path.join(_this._config.rootPath, _this._config.middlewarePath);
                }
                _this._logger = new logger_1.Logger(_this.config.logger, _this);
                if (_this.config.database) {
                    _this._redisClient = dbConfig.initializeRedis(_this.config.database);
                }
                _this.apiProxy = new proxy_1.ApiProxy(_this);
                _this.apiRateLimit = new throttling_1.ApiRateLimit(_this);
                _this.apiAuth = new auth_1.ApiAuth(_this);
                _this.configureServer(ready);
                _this.configureAdminServer();
            }
        });
    };
    Gateway.prototype.configureServer = function (ready) {
        this.app.disable('x-powered-by');
        this.app.use(compression());
        if (this.config.underProxy) {
            this.app.enable('trust proxy');
        }
        if (this.app.get('env') == 'production') {
        }
        else {
            this.app.use(logger('dev'));
        }
        this.loadApis(ready);
    };
    Gateway.prototype.configureAdminServer = function () {
        this.adminApp = express();
        this.adminApp.disable('x-powered-by');
        this.adminApp.use(compression());
        this.adminApp.use(logger('dev'));
    };
    Gateway.prototype.getApiKey = function (api) {
        return api.name + (api.version ? '_' + api.version : '_default');
    };
    return Gateway;
}());
exports.Gateway = Gateway;

//# sourceMappingURL=gateway.js.map
