"use strict";
var Joi = require("joi");
var TargetFilterSchema = Joi.object().keys({
    path: Joi.array().items(Joi.string().regex(/^[a-z\-\/]+$/i)).required(),
    method: Joi.array().items(Joi.string().allow('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD')).required(),
});
var TargetSchema = Joi.object().keys({
    path: Joi.string().required(),
    allow: TargetFilterSchema,
    deny: TargetFilterSchema,
});
var FilterSchema = Joi.object().keys({
    name: Joi.string().required(),
    appliesTo: Joi.array().items(Joi.string())
});
var InterceptorSchema = Joi.object().keys({
    name: Joi.string().required(),
    appliesTo: Joi.array().items(Joi.string())
});
var InterceptorsSchema = Joi.object().keys({
    request: Joi.array().items(InterceptorSchema).required(),
    response: Joi.array().items(InterceptorSchema).required()
});
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
    Joi.validate(proxy, exports.ProxyValidatorSchema, callback);
}
exports.validateProxyConfig = validateProxyConfig;

//# sourceMappingURL=proxy.js.map
