"use strict";
var passport = require('passport');
var passport_local_1 = require('passport-local');
var Utils = require("underscore");
var pathUtil = require("path");
module.exports = function (apiKey, authConfig, gateway) {
    var opts = Utils.omit(authConfig, "verify");
    opts.session = false;
    var p = pathUtil.join(gateway.middlewarePath, 'authentication', 'verify', authConfig.verify);
    var verifyFunction = require(p);
    passport.use(apiKey, new passport_local_1.Strategy(opts, verifyFunction));
};

//# sourceMappingURL=local.js.map
