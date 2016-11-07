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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var typescript_rest_1 = require("typescript-rest");
require("es6-promise");
var Utils = require("underscore");
var APIService = (function () {
    function APIService() {
    }
    APIService.prototype.search = function () {
        return new Promise(function (resolve, reject) {
            resolve(APIService.gateway.apis);
        });
    };
    APIService.prototype.getApi = function (name) {
        return new Promise(function (resolve, reject) {
            resolve(Utils.filter(APIService.gateway.apis, function (apiConfig) {
                return name === apiConfig.name;
            }));
        });
    };
    __decorate([
        typescript_rest_1.GET, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', Promise)
    ], APIService.prototype, "search", null);
    __decorate([
        typescript_rest_1.GET,
        typescript_rest_1.Path(":name"),
        __param(0, typescript_rest_1.PathParam("name")), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [String]), 
        __metadata('design:returntype', Promise)
    ], APIService.prototype, "getApi", null);
    APIService = __decorate([
        typescript_rest_1.Path('apis'), 
        __metadata('design:paramtypes', [])
    ], APIService);
    return APIService;
}());
exports.APIService = APIService;

//# sourceMappingURL=admin-server.js.map
