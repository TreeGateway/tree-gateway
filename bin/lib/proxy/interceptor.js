"use strict";
var path = require("path");
var Utils = require("./utils");
var pathToRegexp = require('path-to-regexp');
var ProxyInterceptor = (function () {
    function ProxyInterceptor(proxy) {
        this.proxy = proxy;
    }
    ProxyInterceptor.prototype.requestInterceptor = function (proxy) {
        if (this.hasRequestInterceptor(proxy)) {
            return (this.buildRequestInterceptor(proxy));
        }
        return null;
    };
    ProxyInterceptor.prototype.responseInterceptor = function (proxy) {
        if (this.hasResponseInterceptor(proxy)) {
            return (this.buildResponseInterceptor(proxy));
        }
        return null;
    };
    ProxyInterceptor.prototype.buildRequestInterceptor = function (proxy) {
        var _this = this;
        var func = new Array();
        func.push("function(proxyReq, originalReq){");
        proxy.interceptor.request.forEach(function (interceptor, index) {
            var p = path.join(_this.proxy.gateway.middlewarePath, 'interceptor', 'request', interceptor.name);
            if (interceptor.appliesTo) {
                func.push("if (");
                interceptor.appliesTo.forEach(function (path, index) {
                    if (index > 0) {
                        func.push("||");
                    }
                    func.push("(pathToRegexp('" + Utils.normalizePath(path) + "').test(originalReq.path))");
                });
                func.push(")");
            }
            func.push("proxyReq = require('" + p + "')(proxyReq, originalReq);");
        });
        func.push("return proxyReq;");
        func.push("}");
        var f;
        eval('f = ' + func.join(''));
        return f;
    };
    ProxyInterceptor.prototype.buildResponseInterceptor = function (proxy) {
        var _this = this;
        var func = new Array();
        func.push("function(rsp, data, req, res, callback){");
        func.push("var continueChain = function(rsp, data, req, res, calback){ callback(null, data);};");
        proxy.interceptor.response.forEach(function (interceptor, index) {
            if (interceptor.appliesTo) {
                func.push("var f" + index + ";");
                func.push("if (");
                interceptor.appliesTo.forEach(function (path, index) {
                    if (index > 0) {
                        func.push("&&");
                    }
                    func.push("!(pathToRegexp('" + Utils.normalizePath(path) + "').test(req.path))");
                });
                func.push(")");
                func.push("f" + index + " = continueChain;");
                func.push("else f" + index + " = ");
            }
            else {
                func.push("var f" + index + " = ");
            }
            var p = path.join(_this.proxy.gateway.middlewarePath, 'interceptor', 'response', interceptor.name);
            func.push("require('" + p + "');");
            func.push("f" + index + "(rsp, data, req, res, (error, value)=>{ \
                if (error) { \
                   callback(error); \
                   return; \
                } \
                data = value;");
        });
        proxy.interceptor.response.forEach(function (interceptor, index) {
            if (index == 0) {
                func.push("callback(null, data);");
            }
            func.push("});");
        });
        func.push("}");
        var f;
        eval('f = ' + func.join(''));
        return f;
    };
    ProxyInterceptor.prototype.hasRequestInterceptor = function (proxy) {
        return (proxy.interceptor && proxy.interceptor.request && proxy.interceptor.request.length > 0);
    };
    ProxyInterceptor.prototype.hasResponseInterceptor = function (proxy) {
        return (proxy.interceptor && proxy.interceptor.response && proxy.interceptor.response.length > 0);
    };
    return ProxyInterceptor;
}());
exports.ProxyInterceptor = ProxyInterceptor;

//# sourceMappingURL=interceptor.js.map
