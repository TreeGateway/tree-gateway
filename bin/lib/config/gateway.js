"use strict";
var Joi = require("joi");
(function (LogLevel) {
    LogLevel[LogLevel["error"] = 0] = "error";
    LogLevel[LogLevel["info"] = 1] = "info";
    LogLevel[LogLevel["debug"] = 2] = "debug";
})(exports.LogLevel || (exports.LogLevel = {}));
var LogLevel = exports.LogLevel;
var LogConsoleConfigSchema = Joi.object().keys({
    timestamp: Joi.boolean(),
    silent: Joi.boolean(),
    colorize: Joi.boolean(),
    json: Joi.boolean(),
    stringify: Joi.boolean(),
    prettyPrint: Joi.boolean(),
    depth: Joi.number().positive(),
    humanReadableUnhandledException: Joi.boolean(),
    showLevel: Joi.boolean(),
    stderrLevels: Joi.array().items(Joi.string().allow('error', 'info', 'debug'))
});
var LogFileConfigSchema = Joi.object().keys({
    filename: Joi.string().regex(/^[a-z\.\/][a-zA-Z0-9\.\/]*$/),
    timestamp: Joi.boolean(),
    silent: Joi.boolean(),
    colorize: Joi.boolean(),
    maxsize: Joi.number().positive(),
    maxFiles: Joi.number().positive(),
    json: Joi.boolean(),
    eol: Joi.string(),
    prettyPrint: Joi.boolean(),
    depth: Joi.number().positive(),
    logstash: Joi.boolean(),
    showLevel: Joi.boolean(),
    tailable: Joi.boolean(),
    maxRetries: Joi.number().positive(),
    zippedArchive: Joi.boolean()
}).with('depth', 'prettyPrint').with('tailable', 'maxFiles');
var LoggerConfigSchema = Joi.object().keys({
    level: Joi.string().allow('error', 'info', 'debug'),
    console: LogConsoleConfigSchema,
    file: LogFileConfigSchema
});
var RedisConfigSchema = Joi.object().keys({
    host: Joi.string().hostname().required(),
    port: Joi.number().positive().required()
});
var AccessLoggerConfigSchema = Joi.object().keys({});
exports.GatewayConfigValidatorSchema = Joi.object().keys({
    listenPort: Joi.number().positive().required(),
    adminPort: Joi.number().positive().required(),
    rootPath: Joi.string().regex(/^[a-z\.\/][a-zA-Z0-9\.\/]*$/),
    apiPath: Joi.string().regex(/^[a-z\.\/][a-zA-Z0-9\.\/]*$/),
    middlewarePath: Joi.string().regex(/^[a-z\.\/][a-zA-Z0-9\.\/]*$/),
    underProxy: Joi.boolean(),
    logger: LoggerConfigSchema,
    database: RedisConfigSchema,
    accessLogger: AccessLoggerConfigSchema
});
function validateGatewayConfig(gatewayConfig, callback) {
    Joi.validate(gatewayConfig, exports.GatewayConfigValidatorSchema, callback);
}
exports.validateGatewayConfig = validateGatewayConfig;

//# sourceMappingURL=gateway.js.map
