"use strict";
var __cov_Jik9dObhExao7pXak0WMrA = (Function('return this'))();
if (!__cov_Jik9dObhExao7pXak0WMrA.$$cov_1478541281104$$) { __cov_Jik9dObhExao7pXak0WMrA.$$cov_1478541281104$$ = {}; }
__cov_Jik9dObhExao7pXak0WMrA = __cov_Jik9dObhExao7pXak0WMrA.$$cov_1478541281104$$;
if (!(__cov_Jik9dObhExao7pXak0WMrA['/Users/thiago/git/tree-gateway/bin/lib/app.js'])) {
   __cov_Jik9dObhExao7pXak0WMrA['/Users/thiago/git/tree-gateway/bin/lib/app.js'] = {"path":"/Users/thiago/git/tree-gateway/bin/lib/app.js","s":{"1":0,"2":0,"3":0,"4":0,"5":0},"b":{},"f":{"1":0},"fnMap":{"1":{"name":"(anonymous_1)","line":5,"loc":{"start":{"line":5,"column":14},"end":{"line":5,"column":26}}}},"statementMap":{"1":{"start":{"line":2,"column":0},"end":{"line":2,"column":37}},"2":{"start":{"line":3,"column":0},"end":{"line":3,"column":47}},"3":{"start":{"line":4,"column":0},"end":{"line":4,"column":81}},"4":{"start":{"line":5,"column":0},"end":{"line":7,"column":3}},"5":{"start":{"line":6,"column":4},"end":{"line":6,"column":25}}},"branchMap":{}};
}
__cov_Jik9dObhExao7pXak0WMrA = __cov_Jik9dObhExao7pXak0WMrA['/Users/thiago/git/tree-gateway/bin/lib/app.js'];
__cov_Jik9dObhExao7pXak0WMrA.s['1']++;
var gateway_1 = require('./gateway');
__cov_Jik9dObhExao7pXak0WMrA.s['2']++;
var command_line_1 = require('./command-line');
__cov_Jik9dObhExao7pXak0WMrA.s['3']++;
var gateway = new gateway_1.Gateway(command_line_1.Parameters.gatewayConfigFile);
__cov_Jik9dObhExao7pXak0WMrA.s['4']++;
gateway.start(function () {
    __cov_Jik9dObhExao7pXak0WMrA.f['1']++;
    __cov_Jik9dObhExao7pXak0WMrA.s['5']++;
    gateway.startAdmin();
});

//# sourceMappingURL=app.js.map
