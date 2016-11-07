"use strict";
var Utils = require("underscore");
var pathUtil = require("path");
var auth = require("passport");
var providedStrategies = {
    'jwt': require('./strategies/jwt'),
    'basic': require('./strategies/basic'),
    'local': require('./strategies/local')
};
var ApiAuth = (function () {
    function ApiAuth(gateway) {
        this.gateway = gateway;
    }
    ApiAuth.prototype.authentication = function (apiKey, path, authentication) {
        var _this = this;
        Utils.keys(authentication).forEach(function (key) {
            try {
                var authConfig = authentication[key];
                if (Utils.has(providedStrategies, key)) {
                    var strategy = providedStrategies[key];
                    strategy(apiKey, authConfig, _this.gateway);
                }
                else {
                    var p = pathUtil.join(_this.gateway.middlewarePath, 'authentication', 'strategies', key);
                    var strategy = require(p);
                    strategy(apiKey, authConfig);
                }
                _this.gateway.server.use(path, auth.authenticate(apiKey, { session: false }));
                if (_this.gateway.logger.isDebugEnabled) {
                    _this.gateway.logger.debug("Authentication Strategy [%s] configured for path [%s]", key, path);
                }
            }
            catch (e) {
                _this.gateway.logger.error("Error configuring Authentication Strategy [%s] for path [%s]", key, path, e);
            }
        });
    };
    return ApiAuth;
}());
exports.ApiAuth = ApiAuth;

//# sourceMappingURL=auth.js.map
