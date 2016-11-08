"use strict";
var __cov_Nw3iUKWarPCEV3wtRoJI3w = (Function('return this'))();
if (!__cov_Nw3iUKWarPCEV3wtRoJI3w.$$cov_1478616766663$$) { __cov_Nw3iUKWarPCEV3wtRoJI3w.$$cov_1478616766663$$ = {}; }
__cov_Nw3iUKWarPCEV3wtRoJI3w = __cov_Nw3iUKWarPCEV3wtRoJI3w.$$cov_1478616766663$$;
if (!(__cov_Nw3iUKWarPCEV3wtRoJI3w['/Users/thiago/git/tree-gateway/bin/lib/config/authentication.js'])) {
   __cov_Nw3iUKWarPCEV3wtRoJI3w['/Users/thiago/git/tree-gateway/bin/lib/config/authentication.js'] = {"path":"/Users/thiago/git/tree-gateway/bin/lib/config/authentication.js","s":{"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":1,"8":0,"9":0},"b":{},"f":{"1":0},"fnMap":{"1":{"name":"validateAuthenticationConfig","line":32,"loc":{"start":{"line":32,"column":0},"end":{"line":32,"column":64}}}},"statementMap":{"1":{"start":{"line":2,"column":0},"end":{"line":2,"column":25}},"2":{"start":{"line":3,"column":0},"end":{"line":9,"column":3}},"3":{"start":{"line":10,"column":0},"end":{"line":18,"column":3}},"4":{"start":{"line":19,"column":0},"end":{"line":21,"column":3}},"5":{"start":{"line":22,"column":0},"end":{"line":26,"column":3}},"6":{"start":{"line":27,"column":0},"end":{"line":31,"column":32}},"7":{"start":{"line":32,"column":0},"end":{"line":34,"column":1}},"8":{"start":{"line":33,"column":4},"end":{"line":33,"column":82}},"9":{"start":{"line":35,"column":0},"end":{"line":35,"column":68}}},"branchMap":{}};
}
__cov_Nw3iUKWarPCEV3wtRoJI3w = __cov_Nw3iUKWarPCEV3wtRoJI3w['/Users/thiago/git/tree-gateway/bin/lib/config/authentication.js'];
__cov_Nw3iUKWarPCEV3wtRoJI3w.s['1']++;
var Joi = require('joi');
__cov_Nw3iUKWarPCEV3wtRoJI3w.s['2']++;
var JWTRequestExtractorSchema = Joi.object().keys({
    header: Joi.string(),
    queryParam: Joi.string(),
    authHeader: Joi.string(),
    bodyField: Joi.string(),
    cookie: Joi.string()
});
__cov_Nw3iUKWarPCEV3wtRoJI3w.s['3']++;
var JWTAuthenticationSchema = Joi.object().keys({
    secretOrKey: Joi.string().required(),
    extractFrom: JWTRequestExtractorSchema,
    issuer: Joi.string(),
    audience: Joi.string(),
    algorithms: Joi.array().items(Joi.string()),
    ignoreExpiration: Joi.boolean(),
    verify: Joi.string()
});
__cov_Nw3iUKWarPCEV3wtRoJI3w.s['4']++;
var BasicAuthenticationSchema = Joi.object().keys({ verify: Joi.string().required() });
__cov_Nw3iUKWarPCEV3wtRoJI3w.s['5']++;
var LocalAuthenticationSchema = Joi.object().keys({
    verify: Joi.string().required(),
    usernameField: Joi.string(),
    passwordField: Joi.string()
});
__cov_Nw3iUKWarPCEV3wtRoJI3w.s['6']++;
exports.AuthenticationValidatorSchema = Joi.object().keys({
    jwt: JWTAuthenticationSchema,
    basic: BasicAuthenticationSchema,
    local: LocalAuthenticationSchema
}).xor('jwt', 'basic', 'local');
function validateAuthenticationConfig(authentication, callback) {
    __cov_Nw3iUKWarPCEV3wtRoJI3w.f['1']++;
    __cov_Nw3iUKWarPCEV3wtRoJI3w.s['8']++;
    Joi.validate(authentication, exports.AuthenticationValidatorSchema, callback);
}
__cov_Nw3iUKWarPCEV3wtRoJI3w.s['9']++;
exports.validateAuthenticationConfig = validateAuthenticationConfig;

//# sourceMappingURL=authentication.js.map
