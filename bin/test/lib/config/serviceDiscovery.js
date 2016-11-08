"use strict";
var __cov_Vy$tMCuc1OXgDxUArIKmkg = (Function('return this'))();
if (!__cov_Vy$tMCuc1OXgDxUArIKmkg.$$cov_1478616766663$$) { __cov_Vy$tMCuc1OXgDxUArIKmkg.$$cov_1478616766663$$ = {}; }
__cov_Vy$tMCuc1OXgDxUArIKmkg = __cov_Vy$tMCuc1OXgDxUArIKmkg.$$cov_1478616766663$$;
if (!(__cov_Vy$tMCuc1OXgDxUArIKmkg['/Users/thiago/git/tree-gateway/bin/lib/config/serviceDiscovery.js'])) {
   __cov_Vy$tMCuc1OXgDxUArIKmkg['/Users/thiago/git/tree-gateway/bin/lib/config/serviceDiscovery.js'] = {"path":"/Users/thiago/git/tree-gateway/bin/lib/config/serviceDiscovery.js","s":{"1":0,"2":0,"3":1,"4":0,"5":0},"b":{},"f":{"1":0},"fnMap":{"1":{"name":"validateServiceDiscoveryConfig","line":4,"loc":{"start":{"line":4,"column":0},"end":{"line":4,"column":68}}}},"statementMap":{"1":{"start":{"line":2,"column":0},"end":{"line":2,"column":25}},"2":{"start":{"line":3,"column":0},"end":{"line":3,"column":70}},"3":{"start":{"line":4,"column":0},"end":{"line":6,"column":1}},"4":{"start":{"line":5,"column":4},"end":{"line":5,"column":92}},"5":{"start":{"line":7,"column":0},"end":{"line":7,"column":72}}},"branchMap":{}};
}
__cov_Vy$tMCuc1OXgDxUArIKmkg = __cov_Vy$tMCuc1OXgDxUArIKmkg['/Users/thiago/git/tree-gateway/bin/lib/config/serviceDiscovery.js'];
__cov_Vy$tMCuc1OXgDxUArIKmkg.s['1']++;
var Joi = require('joi');
__cov_Vy$tMCuc1OXgDxUArIKmkg.s['2']++;
exports.ServiceDiscoveryConfigValidatorSchema = Joi.object().keys({});
function validateServiceDiscoveryConfig(serviceDiscovery, callback) {
    __cov_Vy$tMCuc1OXgDxUArIKmkg.f['1']++;
    __cov_Vy$tMCuc1OXgDxUArIKmkg.s['4']++;
    Joi.validate(serviceDiscovery, exports.ServiceDiscoveryConfigValidatorSchema, callback);
}
__cov_Vy$tMCuc1OXgDxUArIKmkg.s['5']++;
exports.validateServiceDiscoveryConfig = validateServiceDiscoveryConfig;

//# sourceMappingURL=serviceDiscovery.js.map
