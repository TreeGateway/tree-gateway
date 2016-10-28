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
var Utils = require("./utils");
var typescript_ioc_1 = require("typescript-ioc");
var settings_1 = require("../settings");
var path = require("path");
var ProxyFilter = (function () {
    function ProxyFilter() {
    }
    ProxyFilter.prototype.buildFilters = function (proxy) {
        var filterChain = new Array();
        if (this.hasMethodFilter(proxy)) {
            filterChain.push(this.buildMethodFilter(proxy));
        }
        if (this.hasPathFilter(proxy)) {
            filterChain.push(this.buildPathFilter(proxy));
        }
        if (this.hasCustomFilter(proxy)) {
            filterChain.push(this.buildCustomFilter(proxy));
        }
        return filterChain;
    };
    ProxyFilter.prototype.buildCustomFilter = function (proxy) {
        var _this = this;
        var func = new Array();
        func.push("function(req, res){");
        func.push("var accepted = (");
        proxy.filter.forEach(function (filter, index) {
            if (index > 0) {
                func.push("||");
            }
            var p = path.join(_this.settings.middlewarePath, 'filter', filter.name);
            func.push("require('" + p + "')(req, res)");
        });
        func.push(");");
        func.push("return accepted;");
        func.push("}");
        var f;
        eval('f = ' + func.join('\n'));
        return f;
    };
    ProxyFilter.prototype.buildPathFilter = function (proxy) {
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
                func.push("(pathToRegexp('" + Utils.normalizePath(path) + "').test(targetPath))");
            });
            func.push(");");
        }
        if (proxy.target.denyPath && proxy.target.denyPath.length > 0) {
            func.push("accepted = accepted && (");
            proxy.target.denyPath.forEach(function (path, index) {
                if (index > 0) {
                    func.push("&&");
                }
                func.push("!(pathToRegexp('" + Utils.normalizePath(path) + "').test(targetPath))");
            });
            func.push(");");
        }
        func.push("return accepted;");
        func.push("}");
        var f;
        eval('f = ' + func.join('\n'));
        return f;
    };
    ProxyFilter.prototype.buildMethodFilter = function (proxy) {
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
    ProxyFilter.prototype.hasCustomFilter = function (proxy) {
        return (proxy.filter && proxy.filter.length > 0);
    };
    ProxyFilter.prototype.hasPathFilter = function (proxy) {
        return (proxy.target.allowPath && proxy.target.allowPath.length > 0)
            || (proxy.target.denyPath && proxy.target.denyPath.length > 0);
    };
    ProxyFilter.prototype.hasMethodFilter = function (proxy) {
        return (proxy.target.allowMethod && proxy.target.allowMethod.length > 0)
            || (proxy.target.denyMethod && proxy.target.denyMethod.length > 0);
    };
    __decorate([
        typescript_ioc_1.Inject, 
        __metadata('design:type', settings_1.Settings)
    ], ProxyFilter.prototype, "settings", void 0);
    ProxyFilter = __decorate([
        typescript_ioc_1.AutoWired, 
        __metadata('design:paramtypes', [])
    ], ProxyFilter);
    return ProxyFilter;
}());
exports.ProxyFilter = ProxyFilter;

//# sourceMappingURL=filter.js.map
