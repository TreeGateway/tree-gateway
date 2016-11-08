"use strict";
var __cov_KhC4XbyjXb_HGqWQBW4TKg = (Function('return this'))();
if (!__cov_KhC4XbyjXb_HGqWQBW4TKg.$$cov_1478616766663$$) { __cov_KhC4XbyjXb_HGqWQBW4TKg.$$cov_1478616766663$$ = {}; }
__cov_KhC4XbyjXb_HGqWQBW4TKg = __cov_KhC4XbyjXb_HGqWQBW4TKg.$$cov_1478616766663$$;
if (!(__cov_KhC4XbyjXb_HGqWQBW4TKg['/Users/thiago/git/tree-gateway/bin/lib/config/api.js'])) {
   __cov_KhC4XbyjXb_HGqWQBW4TKg['/Users/thiago/git/tree-gateway/bin/lib/config/api.js'] = {"path":"/Users/thiago/git/tree-gateway/bin/lib/config/api.js","s":{"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":1,"8":0,"9":0},"b":{},"f":{"1":0},"fnMap":{"1":{"name":"validateApiConfig","line":16,"loc":{"start":{"line":16,"column":0},"end":{"line":16,"column":48}}}},"statementMap":{"1":{"start":{"line":2,"column":0},"end":{"line":2,"column":51}},"2":{"start":{"line":3,"column":0},"end":{"line":3,"column":43}},"3":{"start":{"line":4,"column":0},"end":{"line":4,"column":33}},"4":{"start":{"line":5,"column":0},"end":{"line":5,"column":55}},"5":{"start":{"line":6,"column":0},"end":{"line":6,"column":25}},"6":{"start":{"line":7,"column":0},"end":{"line":15,"column":3}},"7":{"start":{"line":16,"column":0},"end":{"line":18,"column":1}},"8":{"start":{"line":17,"column":4},"end":{"line":17,"column":72}},"9":{"start":{"line":19,"column":0},"end":{"line":19,"column":46}}},"branchMap":{}};
}
__cov_KhC4XbyjXb_HGqWQBW4TKg = __cov_KhC4XbyjXb_HGqWQBW4TKg['/Users/thiago/git/tree-gateway/bin/lib/config/api.js'];
__cov_KhC4XbyjXb_HGqWQBW4TKg.s['1']++;
var authentication_1 = require('./authentication');
__cov_KhC4XbyjXb_HGqWQBW4TKg.s['2']++;
var throttling_1 = require('./throttling');
__cov_KhC4XbyjXb_HGqWQBW4TKg.s['3']++;
var proxy_1 = require('./proxy');
__cov_KhC4XbyjXb_HGqWQBW4TKg.s['4']++;
var serviceDiscovery_1 = require('./serviceDiscovery');
__cov_KhC4XbyjXb_HGqWQBW4TKg.s['5']++;
var Joi = require('joi');
__cov_KhC4XbyjXb_HGqWQBW4TKg.s['6']++;
exports.ApiConfigValidatorSchema = Joi.object().keys({
    name: Joi.string().alphanum().min(3).max(30).required(),
    version: Joi.string().regex(/^(\d+\.)?(\d+\.)?(\d+)$/).required(),
    proxy: proxy_1.ProxyValidatorSchema.required(),
    description: Joi.string(),
    throttling: throttling_1.ThrottlingConfigValidatorSchema,
    authentication: authentication_1.AuthenticationValidatorSchema,
    serviceDiscovery: serviceDiscovery_1.ServiceDiscoveryConfigValidatorSchema
});
function validateApiConfig(apiConfig, callback) {
    __cov_KhC4XbyjXb_HGqWQBW4TKg.f['1']++;
    __cov_KhC4XbyjXb_HGqWQBW4TKg.s['8']++;
    Joi.validate(apiConfig, exports.ApiConfigValidatorSchema, callback);
}
__cov_KhC4XbyjXb_HGqWQBW4TKg.s['9']++;
exports.validateApiConfig = validateApiConfig;

//# sourceMappingURL=api.js.map
