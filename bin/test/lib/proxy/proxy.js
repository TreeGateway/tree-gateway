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
var typescript_ioc_1 = require("typescript-ioc");
var settings_1 = require("../settings");
var filter_1 = require("./filter");
var interceptor_1 = require("./interceptor");
var proxy = require("express-http-proxy");
var ApiProxy = (function () {
    function ApiProxy() {
    }
    ApiProxy.prototype.proxy = function (api) {
        this.settings.app.use(api.proxy.path, proxy(api.proxy.target.path, this.configureProxy(api.proxy)));
    };
    ApiProxy.prototype.configureProxy = function (proxy) {
        var result = {
            forwardPath: function (req, res) {
                return req.url;
            }
        };
        if (proxy.preserveHostHdr) {
            result['preserveHostHdr'] = proxy.preserveHostHdr;
        }
        if (proxy.timeout) {
            result['timeout'] = proxy.timeout;
        }
        if (proxy.https) {
            result['https'] = proxy.https;
        }
        var filterChain = this.filter.buildFilters(proxy);
        if (filterChain && filterChain.length > 0) {
            result['filter'] = function (req, res) {
                var result = true;
                filterChain.forEach(function (f) {
                    if (result) {
                        result = f(req, res);
                    }
                });
                return result;
            };
        }
        var requestInterceptor = this.interceptor.requestInterceptor(proxy);
        if (requestInterceptor) {
            result['decorateRequest'] = requestInterceptor;
        }
        var responseInterceptor = this.interceptor.responseInterceptor(proxy);
        if (responseInterceptor) {
            result['intercept'] = responseInterceptor;
        }
        return result;
    };
    __decorate([
        typescript_ioc_1.Inject, 
        __metadata('design:type', settings_1.Settings)
    ], ApiProxy.prototype, "settings", void 0);
    __decorate([
        typescript_ioc_1.Inject, 
        __metadata('design:type', filter_1.ProxyFilter)
    ], ApiProxy.prototype, "filter", void 0);
    __decorate([
        typescript_ioc_1.Inject, 
        __metadata('design:type', interceptor_1.ProxyInterceptor)
    ], ApiProxy.prototype, "interceptor", void 0);
    ApiProxy = __decorate([
        typescript_ioc_1.AutoWired, 
        __metadata('design:paramtypes', [])
    ], ApiProxy);
    return ApiProxy;
}());
exports.ApiProxy = ApiProxy;

//# sourceMappingURL=proxy.js.map
