"use strict";
var Utils = require("underscore");
var pathUtil = require("path");
var ApiRateLimit = (function () {
    function ApiRateLimit(gateway) {
        this.gateway = gateway;
    }
    ApiRateLimit.prototype.throttling = function (path, throttling) {
        var RateLimit = require('express-rate-limit');
        var rateConfig = Utils.omit(throttling, "store", "keyGenerator", "handler");
        if (this.gateway.redisClient) {
            var store = require('./store');
            if (this.gateway.logger.isDebugEnabled()) {
                this.gateway.logger.debug("Using Redis as throttling store.");
            }
            rateConfig.store = new store.RedisStore({
                expiry: (throttling.windowMs / 1000) + 1,
                client: this.gateway.redisClient
            });
        }
        var limiter = new RateLimit(rateConfig);
        if (throttling.keyGenerator) {
            var p = pathUtil.join(this.gateway.middlewarePath, 'throttling', 'keyGenerator', throttling.keyGenerator);
            rateConfig.keyGenerator = require(p);
        }
        if (throttling.handler) {
            var p = pathUtil.join(this.gateway.middlewarePath, 'throttling', 'handler', throttling.handler);
            rateConfig.handler = require(p);
        }
        this.gateway.server.use(path, limiter);
    };
    return ApiRateLimit;
}());
exports.ApiRateLimit = ApiRateLimit;

//# sourceMappingURL=throttling.js.map
