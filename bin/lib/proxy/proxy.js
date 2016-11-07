"use strict";
var filter_1 = require("./filter");
var interceptor_1 = require("./interceptor");
var proxy = require("express-http-proxy");
var ApiProxy = (function () {
    function ApiProxy(gateway) {
        this.gateway = gateway;
        this.filter = new filter_1.ProxyFilter(this);
        this.interceptor = new interceptor_1.ProxyInterceptor(this);
    }
    ApiProxy.prototype.proxy = function (api) {
        this.gateway.server.use(api.proxy.path, proxy(api.proxy.target.path, this.configureProxy(api.proxy)));
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
    return ApiProxy;
}());
exports.ApiProxy = ApiProxy;

//# sourceMappingURL=proxy.js.map
