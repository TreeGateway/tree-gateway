"use strict";
var Joi = require("joi");
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
    Joi.validate(throttling, exports.ThrottlingConfigValidatorSchema, callback);
}
exports.validateThrottlingConfig = validateThrottlingConfig;

//# sourceMappingURL=throttling.js.map
