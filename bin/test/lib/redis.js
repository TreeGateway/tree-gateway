"use strict";
var __cov_tuARemCV2Td6asfJumqTDg = (Function('return this'))();
if (!__cov_tuARemCV2Td6asfJumqTDg.$$cov_1478541281104$$) { __cov_tuARemCV2Td6asfJumqTDg.$$cov_1478541281104$$ = {}; }
__cov_tuARemCV2Td6asfJumqTDg = __cov_tuARemCV2Td6asfJumqTDg.$$cov_1478541281104$$;
if (!(__cov_tuARemCV2Td6asfJumqTDg['/Users/thiago/git/tree-gateway/bin/lib/redis.js'])) {
   __cov_tuARemCV2Td6asfJumqTDg['/Users/thiago/git/tree-gateway/bin/lib/redis.js'] = {"path":"/Users/thiago/git/tree-gateway/bin/lib/redis.js","s":{"1":0,"2":0,"3":1,"4":0,"5":0,"6":0},"b":{},"f":{"1":0},"fnMap":{"1":{"name":"initializeRedis","line":4,"loc":{"start":{"line":4,"column":0},"end":{"line":4,"column":33}}}},"statementMap":{"1":{"start":{"line":2,"column":0},"end":{"line":2,"column":31}},"2":{"start":{"line":3,"column":0},"end":{"line":3,"column":35}},"3":{"start":{"line":4,"column":0},"end":{"line":10,"column":1}},"4":{"start":{"line":5,"column":4},"end":{"line":8,"column":7}},"5":{"start":{"line":9,"column":4},"end":{"line":9,"column":47}},"6":{"start":{"line":11,"column":0},"end":{"line":11,"column":42}}},"branchMap":{}};
}
__cov_tuARemCV2Td6asfJumqTDg = __cov_tuARemCV2Td6asfJumqTDg['/Users/thiago/git/tree-gateway/bin/lib/redis.js'];
__cov_tuARemCV2Td6asfJumqTDg.s['1']++;
var redis = require('ioredis');
__cov_tuARemCV2Td6asfJumqTDg.s['2']++;
var defaults = require('defaults');
function initializeRedis(config) {
    __cov_tuARemCV2Td6asfJumqTDg.f['1']++;
    __cov_tuARemCV2Td6asfJumqTDg.s['4']++;
    config = defaults(config, {
        host: 'localhost',
        port: 6379
    });
    __cov_tuARemCV2Td6asfJumqTDg.s['5']++;
    return new redis(config.port, config.host);
}
__cov_tuARemCV2Td6asfJumqTDg.s['6']++;
exports.initializeRedis = initializeRedis;

//# sourceMappingURL=redis.js.map
