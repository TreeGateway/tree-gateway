"use strict";
var __cov_qYCXXZw4__6Ln3P6C7vokw = (Function('return this'))();
if (!__cov_qYCXXZw4__6Ln3P6C7vokw.$$cov_1478616766663$$) { __cov_qYCXXZw4__6Ln3P6C7vokw.$$cov_1478616766663$$ = {}; }
__cov_qYCXXZw4__6Ln3P6C7vokw = __cov_qYCXXZw4__6Ln3P6C7vokw.$$cov_1478616766663$$;
if (!(__cov_qYCXXZw4__6Ln3P6C7vokw['/Users/thiago/git/tree-gateway/bin/lib/config/proxy.js'])) {
   __cov_qYCXXZw4__6Ln3P6C7vokw['/Users/thiago/git/tree-gateway/bin/lib/config/proxy.js'] = {"path":"/Users/thiago/git/tree-gateway/bin/lib/config/proxy.js","s":{"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0,"8":1,"9":0,"10":0},"b":{},"f":{"1":0},"fnMap":{"1":{"name":"validateProxyConfig","line":33,"loc":{"start":{"line":33,"column":0},"end":{"line":33,"column":46}}}},"statementMap":{"1":{"start":{"line":2,"column":0},"end":{"line":2,"column":25}},"2":{"start":{"line":3,"column":0},"end":{"line":6,"column":3}},"3":{"start":{"line":7,"column":0},"end":{"line":11,"column":3}},"4":{"start":{"line":12,"column":0},"end":{"line":15,"column":3}},"5":{"start":{"line":16,"column":0},"end":{"line":19,"column":3}},"6":{"start":{"line":20,"column":0},"end":{"line":23,"column":3}},"7":{"start":{"line":24,"column":0},"end":{"line":32,"column":3}},"8":{"start":{"line":33,"column":0},"end":{"line":35,"column":1}},"9":{"start":{"line":34,"column":4},"end":{"line":34,"column":64}},"10":{"start":{"line":36,"column":0},"end":{"line":36,"column":50}}},"branchMap":{}};
}
__cov_qYCXXZw4__6Ln3P6C7vokw = __cov_qYCXXZw4__6Ln3P6C7vokw['/Users/thiago/git/tree-gateway/bin/lib/config/proxy.js'];
__cov_qYCXXZw4__6Ln3P6C7vokw.s['1']++;
var Joi = require('joi');
__cov_qYCXXZw4__6Ln3P6C7vokw.s['2']++;
var TargetFilterSchema = Joi.object().keys({
    path: Joi.array().items(Joi.string().regex(/^[a-z\-\/]+$/i)).required(),
    method: Joi.array().items(Joi.string().allow('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD')).required()
});
__cov_qYCXXZw4__6Ln3P6C7vokw.s['3']++;
var TargetSchema = Joi.object().keys({
    path: Joi.string().required(),
    allow: TargetFilterSchema,
    deny: TargetFilterSchema
});
__cov_qYCXXZw4__6Ln3P6C7vokw.s['4']++;
var FilterSchema = Joi.object().keys({
    name: Joi.string().required(),
    appliesTo: Joi.array().items(Joi.string())
});
__cov_qYCXXZw4__6Ln3P6C7vokw.s['5']++;
var InterceptorSchema = Joi.object().keys({
    name: Joi.string().required(),
    appliesTo: Joi.array().items(Joi.string())
});
__cov_qYCXXZw4__6Ln3P6C7vokw.s['6']++;
var InterceptorsSchema = Joi.object().keys({
    request: Joi.array().items(InterceptorSchema).required(),
    response: Joi.array().items(InterceptorSchema).required()
});
__cov_qYCXXZw4__6Ln3P6C7vokw.s['7']++;
exports.ProxyValidatorSchema = Joi.object().keys({
    path: Joi.string().regex(/^[a-z\-\/]+$/i).required(),
    target: TargetSchema.required(),
    https: Joi.boolean(),
    filter: Joi.array().items(FilterSchema),
    interceptor: InterceptorsSchema,
    preserveHostHdr: Joi.boolean(),
    timeout: Joi.number()
});
function validateProxyConfig(proxy, callback) {
    __cov_qYCXXZw4__6Ln3P6C7vokw.f['1']++;
    __cov_qYCXXZw4__6Ln3P6C7vokw.s['9']++;
    Joi.validate(proxy, exports.ProxyValidatorSchema, callback);
}
__cov_qYCXXZw4__6Ln3P6C7vokw.s['10']++;
exports.validateProxyConfig = validateProxyConfig;

//# sourceMappingURL=proxy.js.map
