"use strict";
var __cov_0t3jcULzH3XFGGG4C0Alcg = (Function('return this'))();
if (!__cov_0t3jcULzH3XFGGG4C0Alcg.$$cov_1478616766663$$) { __cov_0t3jcULzH3XFGGG4C0Alcg.$$cov_1478616766663$$ = {}; }
__cov_0t3jcULzH3XFGGG4C0Alcg = __cov_0t3jcULzH3XFGGG4C0Alcg.$$cov_1478616766663$$;
if (!(__cov_0t3jcULzH3XFGGG4C0Alcg['/Users/thiago/git/tree-gateway/bin/lib/throttling/store.js'])) {
   __cov_0t3jcULzH3XFGGG4C0Alcg['/Users/thiago/git/tree-gateway/bin/lib/throttling/store.js'] = {"path":"/Users/thiago/git/tree-gateway/bin/lib/throttling/store.js","s":{"1":0,"2":0,"3":1,"4":0,"5":0,"6":0,"7":0,"8":0,"9":0,"10":0,"11":0,"12":0,"13":0,"14":0,"15":0,"16":0,"17":0,"18":0},"b":{"1":[0,0],"2":[0,0],"3":[0,0]},"f":{"1":0,"2":0,"3":0,"4":0,"5":0},"fnMap":{"1":{"name":"(anonymous_1)","line":3,"loc":{"start":{"line":3,"column":18},"end":{"line":3,"column":30}}},"2":{"name":"RedisStore","line":4,"loc":{"start":{"line":4,"column":4},"end":{"line":4,"column":33}}},"3":{"name":"(anonymous_3)","line":10,"loc":{"start":{"line":10,"column":32},"end":{"line":10,"column":51}}},"4":{"name":"(anonymous_4)","line":16,"loc":{"start":{"line":16,"column":18},"end":{"line":16,"column":42}}},"5":{"name":"(anonymous_5)","line":26,"loc":{"start":{"line":26,"column":36},"end":{"line":26,"column":51}}}},"statementMap":{"1":{"start":{"line":2,"column":0},"end":{"line":2,"column":35}},"2":{"start":{"line":3,"column":0},"end":{"line":31,"column":5}},"3":{"start":{"line":4,"column":4},"end":{"line":9,"column":5}},"4":{"start":{"line":5,"column":8},"end":{"line":8,"column":11}},"5":{"start":{"line":10,"column":4},"end":{"line":25,"column":6}},"6":{"start":{"line":11,"column":8},"end":{"line":11,"column":47}},"7":{"start":{"line":12,"column":8},"end":{"line":12,"column":31}},"8":{"start":{"line":13,"column":8},"end":{"line":24,"column":11}},"9":{"start":{"line":17,"column":12},"end":{"line":19,"column":13}},"10":{"start":{"line":18,"column":16},"end":{"line":18,"column":31}},"11":{"start":{"line":20,"column":12},"end":{"line":22,"column":13}},"12":{"start":{"line":21,"column":16},"end":{"line":21,"column":54}},"13":{"start":{"line":23,"column":12},"end":{"line":23,"column":36}},"14":{"start":{"line":26,"column":4},"end":{"line":29,"column":6}},"15":{"start":{"line":27,"column":8},"end":{"line":27,"column":47}},"16":{"start":{"line":28,"column":8},"end":{"line":28,"column":40}},"17":{"start":{"line":30,"column":4},"end":{"line":30,"column":22}},"18":{"start":{"line":32,"column":0},"end":{"line":32,"column":32}}},"branchMap":{"1":{"line":17,"type":"if","locations":[{"start":{"line":17,"column":12},"end":{"line":17,"column":12}},{"start":{"line":17,"column":12},"end":{"line":17,"column":12}}]},"2":{"line":20,"type":"if","locations":[{"start":{"line":20,"column":12},"end":{"line":20,"column":12}},{"start":{"line":20,"column":12},"end":{"line":20,"column":12}}]},"3":{"line":20,"type":"binary-expr","locations":[{"start":{"line":20,"column":16},"end":{"line":20,"column":35}},{"start":{"line":20,"column":39},"end":{"line":20,"column":59}}]}}};
}
__cov_0t3jcULzH3XFGGG4C0Alcg = __cov_0t3jcULzH3XFGGG4C0Alcg['/Users/thiago/git/tree-gateway/bin/lib/throttling/store.js'];
__cov_0t3jcULzH3XFGGG4C0Alcg.s['1']++;
var defaults = require('defaults');
__cov_0t3jcULzH3XFGGG4C0Alcg.s['2']++;
var RedisStore = function () {
    __cov_0t3jcULzH3XFGGG4C0Alcg.f['1']++;
    function RedisStore(options) {
        __cov_0t3jcULzH3XFGGG4C0Alcg.f['2']++;
        __cov_0t3jcULzH3XFGGG4C0Alcg.s['4']++;
        this.options = defaults(options, {
            expiry: 60,
            prefix: 'rl:'
        });
    }
    __cov_0t3jcULzH3XFGGG4C0Alcg.s['5']++;
    RedisStore.prototype.incr = function (key, cb) {
        __cov_0t3jcULzH3XFGGG4C0Alcg.f['3']++;
        __cov_0t3jcULzH3XFGGG4C0Alcg.s['6']++;
        var rdskey = this.options.prefix + key;
        __cov_0t3jcULzH3XFGGG4C0Alcg.s['7']++;
        var opt = this.options;
        __cov_0t3jcULzH3XFGGG4C0Alcg.s['8']++;
        opt.client.multi().incr(rdskey).ttl(rdskey).exec(function (err, replies) {
            __cov_0t3jcULzH3XFGGG4C0Alcg.f['4']++;
            __cov_0t3jcULzH3XFGGG4C0Alcg.s['9']++;
            if (err) {
                __cov_0t3jcULzH3XFGGG4C0Alcg.b['1'][0]++;
                __cov_0t3jcULzH3XFGGG4C0Alcg.s['10']++;
                return cb(err);
            } else {
                __cov_0t3jcULzH3XFGGG4C0Alcg.b['1'][1]++;
            }
            __cov_0t3jcULzH3XFGGG4C0Alcg.s['11']++;
            if ((__cov_0t3jcULzH3XFGGG4C0Alcg.b['3'][0]++, replies[0][1] === 1) || (__cov_0t3jcULzH3XFGGG4C0Alcg.b['3'][1]++, replies[1][1] === -1)) {
                __cov_0t3jcULzH3XFGGG4C0Alcg.b['2'][0]++;
                __cov_0t3jcULzH3XFGGG4C0Alcg.s['12']++;
                opt.client.expire(rdskey, opt.expiry);
            } else {
                __cov_0t3jcULzH3XFGGG4C0Alcg.b['2'][1]++;
            }
            __cov_0t3jcULzH3XFGGG4C0Alcg.s['13']++;
            cb(null, replies[0][1]);
        });
    };
    __cov_0t3jcULzH3XFGGG4C0Alcg.s['14']++;
    RedisStore.prototype.resetKey = function (key) {
        __cov_0t3jcULzH3XFGGG4C0Alcg.f['5']++;
        __cov_0t3jcULzH3XFGGG4C0Alcg.s['15']++;
        var rdskey = this.options.prefix + key;
        __cov_0t3jcULzH3XFGGG4C0Alcg.s['16']++;
        this.options.client.del(rdskey);
    };
    __cov_0t3jcULzH3XFGGG4C0Alcg.s['17']++;
    return RedisStore;
}();
__cov_0t3jcULzH3XFGGG4C0Alcg.s['18']++;
exports.RedisStore = RedisStore;

//# sourceMappingURL=store.js.map
