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
var StringUtils = require("underscore.string");
var typescript_ioc_1 = require("typescript-ioc");
var settings_1 = require("./settings");
var proxy = require("express-http-proxy");
var ApiProxy = (function () {
    function ApiProxy() {
    }
    ApiProxy.prototype.proxy = function (api) {
        this.settings.app.use(api.proxy.path, proxy(api.proxy.target.path, this.configureProxy(api.proxy)));
    };
    ApiProxy.normalizePath = function (path) {
        path = ((StringUtils.startsWith(path, '/')) ? path : '/' + path);
        path = ((StringUtils.endsWith(path, '/')) ? path : path + '/');
        return path;
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
        var filterChain = this.buildFilters(proxy);
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
        return result;
    };
    ApiProxy.prototype.buildFilters = function (proxy) {
        var filterChain = new Array();
        if (this.hasMethodFilter(proxy)) {
            filterChain.push(this.buildMethodFilter(proxy));
        }
        if (this.hasPathFilter(proxy)) {
            filterChain.push(this.buildPathFilter(proxy));
        }
        return filterChain;
    };
    ApiProxy.prototype.buildPathFilter = function (proxy) {
        var func = new Array();
        func.push("function(req, res){");
        func.push("var pathToRegexp = require('path-to-regexp');");
        func.push("var StringUtils = require('underscore.string');");
        func.push("var accepted = true;");
        func.push("var targetPath = req.path;");
        if (proxy.target.allowPath && proxy.target.allowPath.length > 0) {
            func.push("accepted = (");
            proxy.target.allowPath.forEach(function (path, index) {
                if (index > 0) {
                    func.push("||");
                }
                func.push("(pathToRegexp('" + ApiProxy.normalizePath(path) + "').test(targetPath))");
            });
            func.push(");");
        }
        if (proxy.target.denyPath && proxy.target.denyPath.length > 0) {
            func.push("accepted = accepted && (");
            proxy.target.denyPath.forEach(function (path, index) {
                if (index > 0) {
                    func.push("&&");
                }
                func.push("!(pathToRegexp('" + ApiProxy.normalizePath(path) + "').test(targetPath))");
            });
            func.push(");");
        }
        func.push("return accepted;");
        func.push("}");
        var f;
        eval('f = ' + func.join('\n'));
        return f;
    };
    ApiProxy.prototype.buildMethodFilter = function (proxy) {
        var body = new Array();
        body.push("var accepted = true;");
        if (proxy.target.allowMethod && proxy.target.allowMethod.length > 0) {
            body.push("accepted = (");
            proxy.target.allowMethod.forEach(function (method, index) {
                if (index > 0) {
                    body.push("||");
                }
                body.push("(req.method === '" + method.toUpperCase() + "')");
            });
            body.push(");");
        }
        if (proxy.target.denyMethod && proxy.target.denyMethod.length > 0) {
            body.push("accepted = accepted && (");
            proxy.target.denyMethod.forEach(function (method, index) {
                if (index > 0) {
                    body.push("&&");
                }
                body.push("(req.method !== '" + method.toUpperCase() + "')");
            });
            body.push(");");
        }
        body.push("if (!accepted){ res.status(405);}");
        body.push("return accepted;");
        return Function("req", "res", body.join(''));
    };
    ApiProxy.prototype.hasCustomFilter = function (proxy) {
        return (proxy.filter && proxy.filter.length > 0);
    };
    ApiProxy.prototype.hasPathFilter = function (proxy) {
        return (proxy.target.allowPath && proxy.target.allowPath.length > 0)
            || (proxy.target.denyPath && proxy.target.denyPath.length > 0);
    };
    ApiProxy.prototype.hasMethodFilter = function (proxy) {
        return (proxy.target.allowMethod && proxy.target.allowMethod.length > 0)
            || (proxy.target.denyMethod && proxy.target.denyMethod.length > 0);
    };
    __decorate([
        typescript_ioc_1.Inject, 
        __metadata('design:type', settings_1.Settings)
    ], ApiProxy.prototype, "settings", void 0);
    ApiProxy = __decorate([
        typescript_ioc_1.AutoWired, 
        __metadata('design:paramtypes', [])
    ], ApiProxy);
    return ApiProxy;
}());
exports.ApiProxy = ApiProxy;

//# sourceMappingURL=proxy.js.map
