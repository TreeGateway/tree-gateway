"use strict";
var authentication_1 = require("./authentication");
var throttling_1 = require("./throttling");
var proxy_1 = require("./proxy");
var serviceDiscovery_1 = require("./serviceDiscovery");
var Joi = require("joi");
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
    Joi.validate(apiConfig, exports.ApiConfigValidatorSchema, callback);
}
exports.validateApiConfig = validateApiConfig;

//# sourceMappingURL=api.js.map
