"use strict";
var Joi = require("joi");
var JWTRequestExtractorSchema = Joi.object().keys({
    header: Joi.string(),
    queryParam: Joi.string(),
    authHeader: Joi.string(),
    bodyField: Joi.string(),
    cookie: Joi.string()
});
var JWTAuthenticationSchema = Joi.object().keys({
    secretOrKey: Joi.string().required(),
    extractFrom: JWTRequestExtractorSchema,
    issuer: Joi.string(),
    audience: Joi.string(),
    algorithms: Joi.array().items(Joi.string()),
    ignoreExpiration: Joi.boolean(),
    verify: Joi.string()
});
var BasicAuthenticationSchema = Joi.object().keys({
    verify: Joi.string().required()
});
var LocalAuthenticationSchema = Joi.object().keys({
    verify: Joi.string().required(),
    usernameField: Joi.string(),
    passwordField: Joi.string()
});
exports.AuthenticationValidatorSchema = Joi.object().keys({
    jwt: JWTAuthenticationSchema,
    basic: BasicAuthenticationSchema,
    local: LocalAuthenticationSchema,
}).xor('jwt', 'basic', 'local');
function validateAuthenticationConfig(authentication, callback) {
    Joi.validate(authentication, exports.AuthenticationValidatorSchema, callback);
}
exports.validateAuthenticationConfig = validateAuthenticationConfig;

//# sourceMappingURL=authentication.js.map
