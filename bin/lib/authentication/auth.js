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
var Utils = require("underscore");
var typescript_ioc_1 = require("typescript-ioc");
var settings_1 = require("../settings");
var pathUtil = require("path");
var auth = require("passport");
var winston = require("winston");
var providedStrategies = {
    'jwt': require('./strategies/jwt'),
    'basic': require('./strategies/basic'),
    'local': require('./strategies/local')
};
var ApiAuth = (function () {
    function ApiAuth() {
    }
    ApiAuth.prototype.authentication = function (apiKey, path, authentication) {
        var _this = this;
        Utils.keys(authentication).forEach(function (key) {
            try {
                var authConfig = authentication[key];
                if (Utils.has(providedStrategies, key)) {
                    var strategy = providedStrategies[key];
                    strategy(apiKey, authConfig, _this.settings);
                }
                else {
                    var p = pathUtil.join(_this.settings.middlewarePath, 'authentication', 'strategies', key);
                    var strategy = require(p);
                    strategy(apiKey, authConfig);
                }
                _this.settings.app.use(path, auth.authenticate(apiKey, { session: false }));
                winston.debug("Authentication Strategy [%s] configured for path [%s]", key, path);
            }
            catch (e) {
                winston.error("Error configuring Authentication Strategy [%s] for path [%s]", key, path, e);
            }
        });
    };
    __decorate([
        typescript_ioc_1.Inject, 
        __metadata('design:type', settings_1.Settings)
    ], ApiAuth.prototype, "settings", void 0);
    ApiAuth = __decorate([
        typescript_ioc_1.AutoWired, 
        __metadata('design:paramtypes', [])
    ], ApiAuth);
    return ApiAuth;
}());
exports.ApiAuth = ApiAuth;

//# sourceMappingURL=auth.js.map
