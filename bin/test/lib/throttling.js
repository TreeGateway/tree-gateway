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
var settings_1 = require("./settings");
var ApiRateLimit = (function () {
    function ApiRateLimit() {
    }
    ApiRateLimit.prototype.throttling = function (path, throttling) {
        var RateLimit = require('express-rate-limit');
        var rateConfig = Utils.omit(throttling, "store");
        if (throttling.store === 'redis') {
            var RedisStore = require('rate-limit-redis');
            rateConfig.store = new RedisStore({
                expiry: (throttling.windowMs / 1000) + 1
            });
        }
        var limiter = new RateLimit(rateConfig);
        this.settings.app.use(path, limiter);
    };
    __decorate([
        typescript_ioc_1.Inject, 
        __metadata('design:type', settings_1.Settings)
    ], ApiRateLimit.prototype, "settings", void 0);
    ApiRateLimit = __decorate([
        typescript_ioc_1.AutoWired, 
        __metadata('design:paramtypes', [])
    ], ApiRateLimit);
    return ApiRateLimit;
}());
exports.ApiRateLimit = ApiRateLimit;

//# sourceMappingURL=throttling.js.map
