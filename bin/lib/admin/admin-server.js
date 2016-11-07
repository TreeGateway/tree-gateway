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
var typescript_rest_1 = require("typescript-rest");
require("es6-promise");
var APIService = (function () {
    function APIService() {
    }
    APIService.prototype.search = function () {
        return new Promise(function (resolve, reject) {
            console.log('API service called ');
            resolve(["Teste 1"]);
        });
    };
    __decorate([
        typescript_rest_1.GET, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', Promise)
    ], APIService.prototype, "search", null);
    APIService = __decorate([
        typescript_rest_1.Path('apis'), 
        __metadata('design:paramtypes', [])
    ], APIService);
    return APIService;
}());
exports.APIService = APIService;

//# sourceMappingURL=admin-server.js.map
