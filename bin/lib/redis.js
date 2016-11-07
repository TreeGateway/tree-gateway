"use strict";
var redis = require("ioredis");
var defaults = require('defaults');
function initializeRedis(config) {
    config = defaults(config, {
        host: "localhost",
        port: 6379
    });
    return new redis(config.port, config.host);
}
exports.initializeRedis = initializeRedis;

//# sourceMappingURL=redis.js.map
