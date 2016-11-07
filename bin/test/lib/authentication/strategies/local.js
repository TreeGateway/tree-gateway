"use strict";
var __cov_tCMyGAbJ$b_Nh$mkaV4yNw = (Function('return this'))();
if (!__cov_tCMyGAbJ$b_Nh$mkaV4yNw.$$cov_1478541281104$$) { __cov_tCMyGAbJ$b_Nh$mkaV4yNw.$$cov_1478541281104$$ = {}; }
__cov_tCMyGAbJ$b_Nh$mkaV4yNw = __cov_tCMyGAbJ$b_Nh$mkaV4yNw.$$cov_1478541281104$$;
if (!(__cov_tCMyGAbJ$b_Nh$mkaV4yNw['/Users/thiago/git/tree-gateway/bin/lib/authentication/strategies/local.js'])) {
   __cov_tCMyGAbJ$b_Nh$mkaV4yNw['/Users/thiago/git/tree-gateway/bin/lib/authentication/strategies/local.js'] = {"path":"/Users/thiago/git/tree-gateway/bin/lib/authentication/strategies/local.js","s":{"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0,"8":0,"9":0,"10":0},"b":{},"f":{"1":0},"fnMap":{"1":{"name":"(anonymous_1)","line":6,"loc":{"start":{"line":6,"column":17},"end":{"line":6,"column":56}}}},"statementMap":{"1":{"start":{"line":2,"column":0},"end":{"line":2,"column":35}},"2":{"start":{"line":3,"column":0},"end":{"line":3,"column":49}},"3":{"start":{"line":4,"column":0},"end":{"line":4,"column":34}},"4":{"start":{"line":5,"column":0},"end":{"line":5,"column":31}},"5":{"start":{"line":6,"column":0},"end":{"line":12,"column":2}},"6":{"start":{"line":7,"column":4},"end":{"line":7,"column":48}},"7":{"start":{"line":8,"column":4},"end":{"line":8,"column":25}},"8":{"start":{"line":9,"column":4},"end":{"line":9,"column":97}},"9":{"start":{"line":10,"column":4},"end":{"line":10,"column":36}},"10":{"start":{"line":11,"column":4},"end":{"line":11,"column":78}}},"branchMap":{}};
}
__cov_tCMyGAbJ$b_Nh$mkaV4yNw = __cov_tCMyGAbJ$b_Nh$mkaV4yNw['/Users/thiago/git/tree-gateway/bin/lib/authentication/strategies/local.js'];
__cov_tCMyGAbJ$b_Nh$mkaV4yNw.s['1']++;
var passport = require('passport');
__cov_tCMyGAbJ$b_Nh$mkaV4yNw.s['2']++;
var passport_local_1 = require('passport-local');
__cov_tCMyGAbJ$b_Nh$mkaV4yNw.s['3']++;
var Utils = require('underscore');
__cov_tCMyGAbJ$b_Nh$mkaV4yNw.s['4']++;
var pathUtil = require('path');
__cov_tCMyGAbJ$b_Nh$mkaV4yNw.s['5']++;
module.exports = function (apiKey, authConfig, gateway) {
    __cov_tCMyGAbJ$b_Nh$mkaV4yNw.f['1']++;
    __cov_tCMyGAbJ$b_Nh$mkaV4yNw.s['6']++;
    var opts = Utils.omit(authConfig, 'verify');
    __cov_tCMyGAbJ$b_Nh$mkaV4yNw.s['7']++;
    opts.session = false;
    __cov_tCMyGAbJ$b_Nh$mkaV4yNw.s['8']++;
    var p = pathUtil.join(gateway.middlewarePath, 'authentication', 'verify', authConfig.verify);
    __cov_tCMyGAbJ$b_Nh$mkaV4yNw.s['9']++;
    var verifyFunction = require(p);
    __cov_tCMyGAbJ$b_Nh$mkaV4yNw.s['10']++;
    passport.use(apiKey, new passport_local_1.Strategy(opts, verifyFunction));
};

//# sourceMappingURL=local.js.map
