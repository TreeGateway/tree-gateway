"use strict";
var __cov_husHBO05ypxknNwzToPJJg = (Function('return this'))();
if (!__cov_husHBO05ypxknNwzToPJJg.$$cov_1478616766663$$) { __cov_husHBO05ypxknNwzToPJJg.$$cov_1478616766663$$ = {}; }
__cov_husHBO05ypxknNwzToPJJg = __cov_husHBO05ypxknNwzToPJJg.$$cov_1478616766663$$;
if (!(__cov_husHBO05ypxknNwzToPJJg['/Users/thiago/git/tree-gateway/bin/lib/config/throttling.js'])) {
   __cov_husHBO05ypxknNwzToPJJg['/Users/thiago/git/tree-gateway/bin/lib/config/throttling.js'] = {"path":"/Users/thiago/git/tree-gateway/bin/lib/config/throttling.js","s":{"1":0,"2":0,"3":1,"4":0,"5":0},"b":{},"f":{"1":0},"fnMap":{"1":{"name":"validateThrottlingConfig","line":14,"loc":{"start":{"line":14,"column":0},"end":{"line":14,"column":56}}}},"statementMap":{"1":{"start":{"line":2,"column":0},"end":{"line":2,"column":25}},"2":{"start":{"line":3,"column":0},"end":{"line":13,"column":3}},"3":{"start":{"line":14,"column":0},"end":{"line":16,"column":1}},"4":{"start":{"line":15,"column":4},"end":{"line":15,"column":80}},"5":{"start":{"line":17,"column":0},"end":{"line":17,"column":60}}},"branchMap":{}};
}
__cov_husHBO05ypxknNwzToPJJg = __cov_husHBO05ypxknNwzToPJJg['/Users/thiago/git/tree-gateway/bin/lib/config/throttling.js'];
__cov_husHBO05ypxknNwzToPJJg.s['1']++;
var Joi = require('joi');
__cov_husHBO05ypxknNwzToPJJg.s['2']++;
exports.ThrottlingConfigValidatorSchema = Joi.object().keys({
    windowMs: Joi.number(),
    delayAfter: Joi.number(),
    delayMs: Joi.number(),
    max: Joi.number(),
    message: Joi.string(),
    statusCode: Joi.number(),
    headers: Joi.boolean(),
    keyGenerator: Joi.string().alphanum(),
    handler: Joi.string().alphanum()
});
function validateThrottlingConfig(throttling, callback) {
    __cov_husHBO05ypxknNwzToPJJg.f['1']++;
    __cov_husHBO05ypxknNwzToPJJg.s['4']++;
    Joi.validate(throttling, exports.ThrottlingConfigValidatorSchema, callback);
}
__cov_husHBO05ypxknNwzToPJJg.s['5']++;
exports.validateThrottlingConfig = validateThrottlingConfig;

//# sourceMappingURL=throttling.js.map
