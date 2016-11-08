"use strict";
var Joi = require("joi");
exports.ServiceDiscoveryConfigValidatorSchema = Joi.object().keys({});
function validateServiceDiscoveryConfig(serviceDiscovery, callback) {
    Joi.validate(serviceDiscovery, exports.ServiceDiscoveryConfigValidatorSchema, callback);
}
exports.validateServiceDiscoveryConfig = validateServiceDiscoveryConfig;

//# sourceMappingURL=serviceDiscovery.js.map
