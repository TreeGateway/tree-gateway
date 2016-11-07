"use strict";
var __cov_6DHew7HHVRPgV6q3Vrkoyw = (Function('return this'))();
if (!__cov_6DHew7HHVRPgV6q3Vrkoyw.$$cov_1478541281104$$) { __cov_6DHew7HHVRPgV6q3Vrkoyw.$$cov_1478541281104$$ = {}; }
__cov_6DHew7HHVRPgV6q3Vrkoyw = __cov_6DHew7HHVRPgV6q3Vrkoyw.$$cov_1478541281104$$;
if (!(__cov_6DHew7HHVRPgV6q3Vrkoyw['/Users/thiago/git/tree-gateway/bin/lib/authentication/strategies/basic.js'])) {
   __cov_6DHew7HHVRPgV6q3Vrkoyw['/Users/thiago/git/tree-gateway/bin/lib/authentication/strategies/basic.js'] = {"path":"/Users/thiago/git/tree-gateway/bin/lib/authentication/strategies/basic.js","s":{"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0},"b":{},"f":{"1":0},"fnMap":{"1":{"name":"(anonymous_1)","line":5,"loc":{"start":{"line":5,"column":17},"end":{"line":5,"column":56}}}},"statementMap":{"1":{"start":{"line":2,"column":0},"end":{"line":2,"column":35}},"2":{"start":{"line":3,"column":0},"end":{"line":3,"column":47}},"3":{"start":{"line":4,"column":0},"end":{"line":4,"column":31}},"4":{"start":{"line":5,"column":0},"end":{"line":9,"column":2}},"5":{"start":{"line":6,"column":4},"end":{"line":6,"column":97}},"6":{"start":{"line":7,"column":4},"end":{"line":7,"column":36}},"7":{"start":{"line":8,"column":4},"end":{"line":8,"column":76}}},"branchMap":{}};
}
__cov_6DHew7HHVRPgV6q3Vrkoyw = __cov_6DHew7HHVRPgV6q3Vrkoyw['/Users/thiago/git/tree-gateway/bin/lib/authentication/strategies/basic.js'];
__cov_6DHew7HHVRPgV6q3Vrkoyw.s['1']++;
var passport = require('passport');
__cov_6DHew7HHVRPgV6q3Vrkoyw.s['2']++;
var passport_http_1 = require('passport-http');
__cov_6DHew7HHVRPgV6q3Vrkoyw.s['3']++;
var pathUtil = require('path');
__cov_6DHew7HHVRPgV6q3Vrkoyw.s['4']++;
module.exports = function (apiKey, authConfig, gateway) {
    __cov_6DHew7HHVRPgV6q3Vrkoyw.f['1']++;
    __cov_6DHew7HHVRPgV6q3Vrkoyw.s['5']++;
    var p = pathUtil.join(gateway.middlewarePath, 'authentication', 'verify', authConfig.verify);
    __cov_6DHew7HHVRPgV6q3Vrkoyw.s['6']++;
    var verifyFunction = require(p);
    __cov_6DHew7HHVRPgV6q3Vrkoyw.s['7']++;
    passport.use(apiKey, new passport_http_1.BasicStrategy(verifyFunction));
};

//# sourceMappingURL=basic.js.map
