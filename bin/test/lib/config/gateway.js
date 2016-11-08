"use strict";
var __cov_y$HvjU9b3puOTzS6O9uU_g = (Function('return this'))();
if (!__cov_y$HvjU9b3puOTzS6O9uU_g.$$cov_1478616766663$$) { __cov_y$HvjU9b3puOTzS6O9uU_g.$$cov_1478616766663$$ = {}; }
__cov_y$HvjU9b3puOTzS6O9uU_g = __cov_y$HvjU9b3puOTzS6O9uU_g.$$cov_1478616766663$$;
if (!(__cov_y$HvjU9b3puOTzS6O9uU_g['/Users/thiago/git/tree-gateway/bin/lib/config/gateway.js'])) {
   __cov_y$HvjU9b3puOTzS6O9uU_g['/Users/thiago/git/tree-gateway/bin/lib/config/gateway.js'] = {"path":"/Users/thiago/git/tree-gateway/bin/lib/config/gateway.js","s":{"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0,"8":0,"9":0,"10":0,"11":0,"12":0,"13":1,"14":0,"15":0},"b":{"1":[0,0]},"f":{"1":0,"2":0},"fnMap":{"1":{"name":"(anonymous_1)","line":3,"loc":{"start":{"line":3,"column":1},"end":{"line":3,"column":21}}},"2":{"name":"validateGatewayConfig","line":59,"loc":{"start":{"line":59,"column":0},"end":{"line":59,"column":56}}}},"statementMap":{"1":{"start":{"line":2,"column":0},"end":{"line":2,"column":25}},"2":{"start":{"line":3,"column":0},"end":{"line":7,"column":48}},"3":{"start":{"line":4,"column":4},"end":{"line":4,"column":46}},"4":{"start":{"line":5,"column":4},"end":{"line":5,"column":44}},"5":{"start":{"line":6,"column":4},"end":{"line":6,"column":46}},"6":{"start":{"line":8,"column":0},"end":{"line":8,"column":32}},"7":{"start":{"line":9,"column":0},"end":{"line":20,"column":3}},"8":{"start":{"line":21,"column":0},"end":{"line":37,"column":61}},"9":{"start":{"line":38,"column":0},"end":{"line":42,"column":3}},"10":{"start":{"line":43,"column":0},"end":{"line":46,"column":3}},"11":{"start":{"line":47,"column":0},"end":{"line":47,"column":53}},"12":{"start":{"line":48,"column":0},"end":{"line":58,"column":3}},"13":{"start":{"line":59,"column":0},"end":{"line":61,"column":1}},"14":{"start":{"line":60,"column":4},"end":{"line":60,"column":80}},"15":{"start":{"line":62,"column":0},"end":{"line":62,"column":54}}},"branchMap":{"1":{"line":7,"type":"binary-expr","locations":[{"start":{"line":7,"column":3},"end":{"line":7,"column":19}},{"start":{"line":7,"column":24},"end":{"line":7,"column":45}}]}}};
}
__cov_y$HvjU9b3puOTzS6O9uU_g = __cov_y$HvjU9b3puOTzS6O9uU_g['/Users/thiago/git/tree-gateway/bin/lib/config/gateway.js'];
__cov_y$HvjU9b3puOTzS6O9uU_g.s['1']++;
var Joi = require('joi');
__cov_y$HvjU9b3puOTzS6O9uU_g.s['2']++;
(function (LogLevel) {
    __cov_y$HvjU9b3puOTzS6O9uU_g.f['1']++;
    __cov_y$HvjU9b3puOTzS6O9uU_g.s['3']++;
    LogLevel[LogLevel['error'] = 0] = 'error';
    __cov_y$HvjU9b3puOTzS6O9uU_g.s['4']++;
    LogLevel[LogLevel['info'] = 1] = 'info';
    __cov_y$HvjU9b3puOTzS6O9uU_g.s['5']++;
    LogLevel[LogLevel['debug'] = 2] = 'debug';
}((__cov_y$HvjU9b3puOTzS6O9uU_g.b['1'][0]++, exports.LogLevel) || (__cov_y$HvjU9b3puOTzS6O9uU_g.b['1'][1]++, exports.LogLevel = {})));
__cov_y$HvjU9b3puOTzS6O9uU_g.s['6']++;
var LogLevel = exports.LogLevel;
__cov_y$HvjU9b3puOTzS6O9uU_g.s['7']++;
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
__cov_y$HvjU9b3puOTzS6O9uU_g.s['8']++;
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
__cov_y$HvjU9b3puOTzS6O9uU_g.s['9']++;
var LoggerConfigSchema = Joi.object().keys({
    level: Joi.string().allow('error', 'info', 'debug'),
    console: LogConsoleConfigSchema,
    file: LogFileConfigSchema
});
__cov_y$HvjU9b3puOTzS6O9uU_g.s['10']++;
var RedisConfigSchema = Joi.object().keys({
    host: Joi.string().hostname().required(),
    port: Joi.number().positive().required()
});
__cov_y$HvjU9b3puOTzS6O9uU_g.s['11']++;
var AccessLoggerConfigSchema = Joi.object().keys({});
__cov_y$HvjU9b3puOTzS6O9uU_g.s['12']++;
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
    __cov_y$HvjU9b3puOTzS6O9uU_g.f['2']++;
    __cov_y$HvjU9b3puOTzS6O9uU_g.s['14']++;
    Joi.validate(gatewayConfig, exports.GatewayConfigValidatorSchema, callback);
}
__cov_y$HvjU9b3puOTzS6O9uU_g.s['15']++;
exports.validateGatewayConfig = validateGatewayConfig;

//# sourceMappingURL=gateway.js.map
