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
var express = require("express");
var typescript_ioc_1 = require("typescript-ioc");
var provider = {
    get: function () {
        var settings = new Settings();
        settings.app = express();
        return settings;
    }
};
var Settings = (function () {
    function Settings() {
    }
    Settings = __decorate([
        typescript_ioc_1.AutoWired,
        typescript_ioc_1.Scoped(typescript_ioc_1.Scope.Singleton),
        typescript_ioc_1.Provided(provider), 
        __metadata('design:paramtypes', [])
    ], Settings);
    return Settings;
}());
exports.Settings = Settings;

//# sourceMappingURL=settings.js.map
