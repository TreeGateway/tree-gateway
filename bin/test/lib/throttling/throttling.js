"use strict";
var __cov_a4q3tKH$piGIuaxIyz1xsQ = (Function('return this'))();
if (!__cov_a4q3tKH$piGIuaxIyz1xsQ.$$cov_1478541281104$$) { __cov_a4q3tKH$piGIuaxIyz1xsQ.$$cov_1478541281104$$ = {}; }
__cov_a4q3tKH$piGIuaxIyz1xsQ = __cov_a4q3tKH$piGIuaxIyz1xsQ.$$cov_1478541281104$$;
if (!(__cov_a4q3tKH$piGIuaxIyz1xsQ['/Users/thiago/git/tree-gateway/bin/lib/throttling/throttling.js'])) {
   __cov_a4q3tKH$piGIuaxIyz1xsQ['/Users/thiago/git/tree-gateway/bin/lib/throttling/throttling.js'] = {"path":"/Users/thiago/git/tree-gateway/bin/lib/throttling/throttling.js","s":{"1":0,"2":0,"3":0,"4":1,"5":0,"6":0,"7":0,"8":0,"9":0,"10":0,"11":0,"12":0,"13":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0},"b":{"1":[0,0],"2":[0,0],"3":[0,0],"4":[0,0]},"f":{"1":0,"2":0,"3":0},"fnMap":{"1":{"name":"(anonymous_1)","line":4,"loc":{"start":{"line":4,"column":20},"end":{"line":4,"column":32}}},"2":{"name":"ApiRateLimit","line":5,"loc":{"start":{"line":5,"column":4},"end":{"line":5,"column":35}}},"3":{"name":"(anonymous_3)","line":8,"loc":{"start":{"line":8,"column":40},"end":{"line":8,"column":68}}}},"statementMap":{"1":{"start":{"line":2,"column":0},"end":{"line":2,"column":34}},"2":{"start":{"line":3,"column":0},"end":{"line":3,"column":31}},"3":{"start":{"line":4,"column":0},"end":{"line":33,"column":5}},"4":{"start":{"line":5,"column":4},"end":{"line":7,"column":5}},"5":{"start":{"line":6,"column":8},"end":{"line":6,"column":31}},"6":{"start":{"line":8,"column":4},"end":{"line":31,"column":6}},"7":{"start":{"line":9,"column":8},"end":{"line":9,"column":54}},"8":{"start":{"line":10,"column":8},"end":{"line":10,"column":84}},"9":{"start":{"line":11,"column":8},"end":{"line":20,"column":9}},"10":{"start":{"line":12,"column":12},"end":{"line":12,"column":43}},"11":{"start":{"line":13,"column":12},"end":{"line":15,"column":13}},"12":{"start":{"line":14,"column":16},"end":{"line":14,"column":78}},"13":{"start":{"line":16,"column":12},"end":{"line":19,"column":15}},"14":{"start":{"line":21,"column":8},"end":{"line":21,"column":48}},"15":{"start":{"line":22,"column":8},"end":{"line":25,"column":9}},"16":{"start":{"line":23,"column":12},"end":{"line":23,"column":118}},"17":{"start":{"line":24,"column":12},"end":{"line":24,"column":49}},"18":{"start":{"line":26,"column":8},"end":{"line":29,"column":9}},"19":{"start":{"line":27,"column":12},"end":{"line":27,"column":108}},"20":{"start":{"line":28,"column":12},"end":{"line":28,"column":44}},"21":{"start":{"line":30,"column":8},"end":{"line":30,"column":47}},"22":{"start":{"line":32,"column":4},"end":{"line":32,"column":24}},"23":{"start":{"line":34,"column":0},"end":{"line":34,"column":36}}},"branchMap":{"1":{"line":11,"type":"if","locations":[{"start":{"line":11,"column":8},"end":{"line":11,"column":8}},{"start":{"line":11,"column":8},"end":{"line":11,"column":8}}]},"2":{"line":13,"type":"if","locations":[{"start":{"line":13,"column":12},"end":{"line":13,"column":12}},{"start":{"line":13,"column":12},"end":{"line":13,"column":12}}]},"3":{"line":22,"type":"if","locations":[{"start":{"line":22,"column":8},"end":{"line":22,"column":8}},{"start":{"line":22,"column":8},"end":{"line":22,"column":8}}]},"4":{"line":26,"type":"if","locations":[{"start":{"line":26,"column":8},"end":{"line":26,"column":8}},{"start":{"line":26,"column":8},"end":{"line":26,"column":8}}]}}};
}
__cov_a4q3tKH$piGIuaxIyz1xsQ = __cov_a4q3tKH$piGIuaxIyz1xsQ['/Users/thiago/git/tree-gateway/bin/lib/throttling/throttling.js'];
__cov_a4q3tKH$piGIuaxIyz1xsQ.s['1']++;
var Utils = require('underscore');
__cov_a4q3tKH$piGIuaxIyz1xsQ.s['2']++;
var pathUtil = require('path');
__cov_a4q3tKH$piGIuaxIyz1xsQ.s['3']++;
var ApiRateLimit = function () {
    __cov_a4q3tKH$piGIuaxIyz1xsQ.f['1']++;
    function ApiRateLimit(gateway) {
        __cov_a4q3tKH$piGIuaxIyz1xsQ.f['2']++;
        __cov_a4q3tKH$piGIuaxIyz1xsQ.s['5']++;
        this.gateway = gateway;
    }
    __cov_a4q3tKH$piGIuaxIyz1xsQ.s['6']++;
    ApiRateLimit.prototype.throttling = function (path, throttling) {
        __cov_a4q3tKH$piGIuaxIyz1xsQ.f['3']++;
        __cov_a4q3tKH$piGIuaxIyz1xsQ.s['7']++;
        var RateLimit = require('express-rate-limit');
        __cov_a4q3tKH$piGIuaxIyz1xsQ.s['8']++;
        var rateConfig = Utils.omit(throttling, 'store', 'keyGenerator', 'handler');
        __cov_a4q3tKH$piGIuaxIyz1xsQ.s['9']++;
        if (this.gateway.redisClient) {
            __cov_a4q3tKH$piGIuaxIyz1xsQ.b['1'][0]++;
            __cov_a4q3tKH$piGIuaxIyz1xsQ.s['10']++;
            var store = require('./store');
            __cov_a4q3tKH$piGIuaxIyz1xsQ.s['11']++;
            if (this.gateway.logger.isDebugEnabled()) {
                __cov_a4q3tKH$piGIuaxIyz1xsQ.b['2'][0]++;
                __cov_a4q3tKH$piGIuaxIyz1xsQ.s['12']++;
                this.gateway.logger.debug('Using Redis as throttling store.');
            } else {
                __cov_a4q3tKH$piGIuaxIyz1xsQ.b['2'][1]++;
            }
            __cov_a4q3tKH$piGIuaxIyz1xsQ.s['13']++;
            rateConfig.store = new store.RedisStore({
                expiry: throttling.windowMs / 1000 + 1,
                client: this.gateway.redisClient
            });
        } else {
            __cov_a4q3tKH$piGIuaxIyz1xsQ.b['1'][1]++;
        }
        __cov_a4q3tKH$piGIuaxIyz1xsQ.s['14']++;
        var limiter = new RateLimit(rateConfig);
        __cov_a4q3tKH$piGIuaxIyz1xsQ.s['15']++;
        if (throttling.keyGenerator) {
            __cov_a4q3tKH$piGIuaxIyz1xsQ.b['3'][0]++;
            __cov_a4q3tKH$piGIuaxIyz1xsQ.s['16']++;
            var p = pathUtil.join(this.gateway.middlewarePath, 'throttling', 'keyGenerator', throttling.keyGenerator);
            __cov_a4q3tKH$piGIuaxIyz1xsQ.s['17']++;
            rateConfig.keyGenerator = require(p);
        } else {
            __cov_a4q3tKH$piGIuaxIyz1xsQ.b['3'][1]++;
        }
        __cov_a4q3tKH$piGIuaxIyz1xsQ.s['18']++;
        if (throttling.handler) {
            __cov_a4q3tKH$piGIuaxIyz1xsQ.b['4'][0]++;
            __cov_a4q3tKH$piGIuaxIyz1xsQ.s['19']++;
            var p = pathUtil.join(this.gateway.middlewarePath, 'throttling', 'handler', throttling.handler);
            __cov_a4q3tKH$piGIuaxIyz1xsQ.s['20']++;
            rateConfig.handler = require(p);
        } else {
            __cov_a4q3tKH$piGIuaxIyz1xsQ.b['4'][1]++;
        }
        __cov_a4q3tKH$piGIuaxIyz1xsQ.s['21']++;
        this.gateway.server.use(path, limiter);
    };
    __cov_a4q3tKH$piGIuaxIyz1xsQ.s['22']++;
    return ApiRateLimit;
}();
__cov_a4q3tKH$piGIuaxIyz1xsQ.s['23']++;
exports.ApiRateLimit = ApiRateLimit;

//# sourceMappingURL=throttling.js.map
