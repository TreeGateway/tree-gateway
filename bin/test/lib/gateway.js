"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var fs = require("fs-extra");
var StringUtils = require("underscore.string");
var proxy_1 = require("./proxy");
var throttling_1 = require("./throttling");
var es5_compat_1 = require("./es5-compat");
var settings_1 = require("./settings");
var typescript_ioc_1 = require("typescript-ioc");
var winston = require("winston");
var Gateway = (function () {
    function Gateway() {
    }
    Object.defineProperty(Gateway.prototype, "server", {
        get: function () {
            return this.settings.app;
        },
        enumerable: true,
        configurable: true
    });
    Gateway.prototype.configure = function (path, ready) {
        var _this = this;
        this.apis = new es5_compat_1.StringMap();
        fs.readdir(path, function (err, files) {
            if (err) {
                winston.error("Error reading directory: " + err);
            }
            else {
                path = ((StringUtils.endsWith(path, '/')) ? path : path + '/');
                var length_1 = files.length;
                files.forEach(function (fileName, index) {
                    if (StringUtils.endsWith(fileName, '.json')) {
                        fs.readJson(path + fileName, function (error, apiConfig) {
                            if (error) {
                                winston.error("Error reading directory: " + error);
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
        winston.info("Configuring API [" + api.name + "] on path: " + api.proxy.path);
        var apiKey = this.getApiKey(api);
        this.apis.set(apiKey, api);
        api.proxy.path = ((StringUtils.startsWith(api.proxy.path, '/')) ? api.proxy.path : '/' + api.proxy.path);
        if (api.throttling) {
            winston.debug("Configuring API Rate Limits");
            this.apiRateLimit.throttling(api.proxy.path, api.throttling);
        }
        winston.debug("Configuring API Proxy");
        this.apiProxy.proxy(api);
        if (ready) {
            ready();
        }
    };
    Gateway.prototype.getApiKey = function (api) {
        return api.name + (api.version ? '_' + api.version : '_default');
    };
    __decorate([
        typescript_ioc_1.Inject, 
        __metadata('design:type', settings_1.Settings)
    ], Gateway.prototype, "settings", void 0);
    __decorate([
        typescript_ioc_1.Inject, 
        __metadata('design:type', proxy_1.ApiProxy)
    ], Gateway.prototype, "apiProxy", void 0);
    __decorate([
        typescript_ioc_1.Inject, 
        __metadata('design:type', throttling_1.ApiRateLimit)
    ], Gateway.prototype, "apiRateLimit", void 0);
    Gateway = __decorate([
        typescript_ioc_1.AutoWired, 
        __metadata('design:paramtypes', [])
    ], Gateway);
    return Gateway;
}());
exports.Gateway = Gateway;

//# sourceMappingURL=gateway.js.map
