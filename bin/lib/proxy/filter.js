"use strict";
var Utils = require("./utils");
var path = require("path");
var pathToRegexp = require('path-to-regexp');
var ProxyFilter = (function () {
    function ProxyFilter(proxy) {
        this.proxy = proxy;
    }
    ProxyFilter.prototype.buildFilters = function (proxy) {
        var filterChain = new Array();
        if (proxy.target.allow) {
            filterChain.push(this.buildAllowFilter(proxy.target.allow));
        }
        if (proxy.target.deny) {
            filterChain.push(this.buildDenyFilter(proxy.target.deny));
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
        func.push("var accepted = true;");
        func.push("accepted = (");
        proxy.filter.forEach(function (filter, index) {
            if (index > 0) {
                func.push("&&");
            }
            func.push("(");
            if (filter.appliesTo) {
                func.push("!(");
                filter.appliesTo.forEach(function (path, index) {
                    if (index > 0) {
                        func.push("||");
                    }
                    func.push("(pathToRegexp('" + Utils.normalizePath(path) + "').test(req.path))");
                });
                func.push(") ? accepted :");
            }
            var p = path.join(_this.proxy.gateway.middlewarePath, 'filter', filter.name);
            func.push("require('" + p + "')(req, res)");
            func.push(")");
        });
        func.push(");");
        func.push("return accepted;");
        func.push("}");
        var f;
        eval('f = ' + func.join('\n'));
        return f;
    };
    ProxyFilter.prototype.buildAllowFilter = function (allow) {
        var func = new Array();
        func.push("function(req, res){");
        func.push("var accepted = true;");
        func.push("var targetPath = req.path;");
        if (allow.path && allow.path.length > 0) {
            func.push("accepted = (");
            allow.method.forEach(function (method, index) {
                if (index > 0) {
                    func.push("||");
                }
                func.push("(req.method === '" + method.toUpperCase() + "')");
            });
            func.push(");");
        }
        if (allow.method && allow.method.length > 0) {
            func.push("if (accepted) {");
            func.push("accepted = (");
            allow.path.forEach(function (path, index) {
                if (index > 0) {
                    func.push("||");
                }
                func.push("(pathToRegexp('" + Utils.normalizePath(path) + "').test(targetPath))");
            });
            func.push(");");
            func.push("}");
        }
        func.push("return accepted;");
        func.push("}");
        var f;
        eval('f = ' + func.join(''));
        return f;
    };
    ProxyFilter.prototype.buildDenyFilter = function (deny) {
        var func = new Array();
        func.push("function(req, res){");
        func.push("var accepted = true;");
        func.push("var targetPath = req.path;");
        if (deny.path && deny.path.length > 0) {
            func.push("accepted = (");
            deny.method.forEach(function (method, index) {
                if (index > 0) {
                    func.push("&&");
                }
                func.push("(req.method !== '" + method.toUpperCase() + "')");
            });
            func.push(");");
        }
        if (deny.method && deny.method.length > 0) {
            func.push("if (accepted) {");
            func.push("accepted = (");
            deny.path.forEach(function (path, index) {
                if (index > 0) {
                    func.push("&&");
                }
                func.push("!(pathToRegexp('" + Utils.normalizePath(path) + "').test(targetPath))");
            });
            func.push(");");
            func.push("}");
        }
        func.push("return accepted;");
        func.push("}");
        var f;
        eval('f = ' + func.join(''));
        return f;
    };
    ProxyFilter.prototype.hasCustomFilter = function (proxy) {
        return (proxy.filter && proxy.filter.length > 0);
    };
    return ProxyFilter;
}());
exports.ProxyFilter = ProxyFilter;

//# sourceMappingURL=filter.js.map
