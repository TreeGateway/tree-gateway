"use strict";
var __cov_hMVSQgH$cf4eVP2BstpviA = (Function('return this'))();
if (!__cov_hMVSQgH$cf4eVP2BstpviA.$$cov_1478601267951$$) { __cov_hMVSQgH$cf4eVP2BstpviA.$$cov_1478601267951$$ = {}; }
__cov_hMVSQgH$cf4eVP2BstpviA = __cov_hMVSQgH$cf4eVP2BstpviA.$$cov_1478601267951$$;
if (!(__cov_hMVSQgH$cf4eVP2BstpviA['/Users/thiago/git/tree-gateway/bin/lib/logger.js'])) {
   __cov_hMVSQgH$cf4eVP2BstpviA['/Users/thiago/git/tree-gateway/bin/lib/logger.js'] = {"path":"/Users/thiago/git/tree-gateway/bin/lib/logger.js","s":{"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0,"8":1,"9":0,"10":0,"11":0,"12":0,"13":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0,"24":0,"25":0,"26":0,"27":0,"28":0,"29":0,"30":0,"31":0,"32":0,"33":0,"34":0,"35":0,"36":0,"37":0,"38":0,"39":0,"40":0,"41":0,"42":0,"43":0,"44":0,"45":0},"b":{"1":[0,0],"2":[0,0],"3":[0,0],"4":[0,0],"5":[0,0],"6":[0,0]},"f":{"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0,"8":0,"9":0},"fnMap":{"1":{"name":"(anonymous_1)","line":8,"loc":{"start":{"line":8,"column":14},"end":{"line":8,"column":26}}},"2":{"name":"Logger","line":9,"loc":{"start":{"line":9,"column":4},"end":{"line":9,"column":37}}},"3":{"name":"(anonymous_3)","line":13,"loc":{"start":{"line":13,"column":41},"end":{"line":13,"column":68}}},"4":{"name":"(anonymous_4)","line":34,"loc":{"start":{"line":34,"column":38},"end":{"line":34,"column":50}}},"5":{"name":"(anonymous_5)","line":37,"loc":{"start":{"line":37,"column":37},"end":{"line":37,"column":49}}},"6":{"name":"(anonymous_6)","line":40,"loc":{"start":{"line":40,"column":38},"end":{"line":40,"column":50}}},"7":{"name":"(anonymous_7)","line":43,"loc":{"start":{"line":43,"column":29},"end":{"line":43,"column":41}}},"8":{"name":"(anonymous_8)","line":50,"loc":{"start":{"line":50,"column":28},"end":{"line":50,"column":40}}},"9":{"name":"(anonymous_9)","line":57,"loc":{"start":{"line":57,"column":29},"end":{"line":57,"column":41}}}},"statementMap":{"1":{"start":{"line":2,"column":0},"end":{"line":2,"column":33}},"2":{"start":{"line":3,"column":0},"end":{"line":3,"column":44}},"3":{"start":{"line":4,"column":0},"end":{"line":4,"column":47}},"4":{"start":{"line":5,"column":0},"end":{"line":5,"column":27}},"5":{"start":{"line":6,"column":0},"end":{"line":6,"column":29}},"6":{"start":{"line":7,"column":0},"end":{"line":7,"column":35}},"7":{"start":{"line":8,"column":0},"end":{"line":65,"column":5}},"8":{"start":{"line":9,"column":4},"end":{"line":12,"column":5}},"9":{"start":{"line":10,"column":8},"end":{"line":10,"column":29}},"10":{"start":{"line":11,"column":8},"end":{"line":11,"column":63}},"11":{"start":{"line":13,"column":4},"end":{"line":33,"column":6}},"12":{"start":{"line":14,"column":8},"end":{"line":14,"column":91}},"13":{"start":{"line":15,"column":8},"end":{"line":18,"column":10}},"14":{"start":{"line":19,"column":8},"end":{"line":21,"column":9}},"15":{"start":{"line":20,"column":12},"end":{"line":20,"column":84}},"16":{"start":{"line":22,"column":8},"end":{"line":31,"column":9}},"17":{"start":{"line":23,"column":12},"end":{"line":25,"column":15}},"18":{"start":{"line":26,"column":12},"end":{"line":29,"column":13}},"19":{"start":{"line":27,"column":16},"end":{"line":27,"column":96}},"20":{"start":{"line":28,"column":16},"end":{"line":28,"column":69}},"21":{"start":{"line":30,"column":12},"end":{"line":30,"column":78}},"22":{"start":{"line":32,"column":8},"end":{"line":32,"column":43}},"23":{"start":{"line":34,"column":4},"end":{"line":36,"column":6}},"24":{"start":{"line":35,"column":8},"end":{"line":35,"column":55}},"25":{"start":{"line":37,"column":4},"end":{"line":39,"column":6}},"26":{"start":{"line":38,"column":8},"end":{"line":38,"column":53}},"27":{"start":{"line":40,"column":4},"end":{"line":42,"column":6}},"28":{"start":{"line":41,"column":8},"end":{"line":41,"column":54}},"29":{"start":{"line":43,"column":4},"end":{"line":49,"column":6}},"30":{"start":{"line":44,"column":8},"end":{"line":44,"column":22}},"31":{"start":{"line":45,"column":8},"end":{"line":47,"column":9}},"32":{"start":{"line":46,"column":12},"end":{"line":46,"column":41}},"33":{"start":{"line":48,"column":8},"end":{"line":48,"column":50}},"34":{"start":{"line":50,"column":4},"end":{"line":56,"column":6}},"35":{"start":{"line":51,"column":8},"end":{"line":51,"column":22}},"36":{"start":{"line":52,"column":8},"end":{"line":54,"column":9}},"37":{"start":{"line":53,"column":12},"end":{"line":53,"column":41}},"38":{"start":{"line":55,"column":8},"end":{"line":55,"column":49}},"39":{"start":{"line":57,"column":4},"end":{"line":63,"column":6}},"40":{"start":{"line":58,"column":8},"end":{"line":58,"column":22}},"41":{"start":{"line":59,"column":8},"end":{"line":61,"column":9}},"42":{"start":{"line":60,"column":12},"end":{"line":60,"column":41}},"43":{"start":{"line":62,"column":8},"end":{"line":62,"column":50}},"44":{"start":{"line":64,"column":4},"end":{"line":64,"column":18}},"45":{"start":{"line":66,"column":0},"end":{"line":66,"column":24}}},"branchMap":{"1":{"line":14,"type":"cond-expr","locations":[{"start":{"line":14,"column":31},"end":{"line":14,"column":63}},{"start":{"line":14,"column":66},"end":{"line":14,"column":89}}]},"2":{"line":19,"type":"if","locations":[{"start":{"line":19,"column":8},"end":{"line":19,"column":8}},{"start":{"line":19,"column":8},"end":{"line":19,"column":8}}]},"3":{"line":19,"type":"binary-expr","locations":[{"start":{"line":19,"column":12},"end":{"line":19,"column":18}},{"start":{"line":19,"column":22},"end":{"line":19,"column":36}}]},"4":{"line":22,"type":"if","locations":[{"start":{"line":22,"column":8},"end":{"line":22,"column":8}},{"start":{"line":22,"column":8},"end":{"line":22,"column":8}}]},"5":{"line":22,"type":"binary-expr","locations":[{"start":{"line":22,"column":12},"end":{"line":22,"column":18}},{"start":{"line":22,"column":22},"end":{"line":22,"column":33}}]},"6":{"line":26,"type":"if","locations":[{"start":{"line":26,"column":12},"end":{"line":26,"column":12}},{"start":{"line":26,"column":12},"end":{"line":26,"column":12}}]}}};
}
__cov_hMVSQgH$cf4eVP2BstpviA = __cov_hMVSQgH$cf4eVP2BstpviA['/Users/thiago/git/tree-gateway/bin/lib/logger.js'];
__cov_hMVSQgH$cf4eVP2BstpviA.s['1']++;
var Winston = require('winston');
__cov_hMVSQgH$cf4eVP2BstpviA.s['2']++;
var gateway_1 = require('./config/gateway');
__cov_hMVSQgH$cf4eVP2BstpviA.s['3']++;
var StringUtils = require('underscore.string');
__cov_hMVSQgH$cf4eVP2BstpviA.s['4']++;
var path = require('path');
__cov_hMVSQgH$cf4eVP2BstpviA.s['5']++;
var fs = require('fs-extra');
__cov_hMVSQgH$cf4eVP2BstpviA.s['6']++;
var defaults = require('defaults');
__cov_hMVSQgH$cf4eVP2BstpviA.s['7']++;
var Logger = function () {
    __cov_hMVSQgH$cf4eVP2BstpviA.f['1']++;
    function Logger(config, gateway) {
        __cov_hMVSQgH$cf4eVP2BstpviA.f['2']++;
        __cov_hMVSQgH$cf4eVP2BstpviA.s['9']++;
        this.config = config;
        __cov_hMVSQgH$cf4eVP2BstpviA.s['10']++;
        this.winston = this.instantiateLogger(config, gateway);
    }
    __cov_hMVSQgH$cf4eVP2BstpviA.s['11']++;
    Logger.prototype.instantiateLogger = function (config, gateway) {
        __cov_hMVSQgH$cf4eVP2BstpviA.f['3']++;
        __cov_hMVSQgH$cf4eVP2BstpviA.s['12']++;
        this.level = config ? (__cov_hMVSQgH$cf4eVP2BstpviA.b['1'][0]++, gateway_1.LogLevel[config.level]) : (__cov_hMVSQgH$cf4eVP2BstpviA.b['1'][1]++, gateway_1.LogLevel.info);
        __cov_hMVSQgH$cf4eVP2BstpviA.s['13']++;
        var options = {
            level: gateway_1.LogLevel[this.level],
            transports: []
        };
        __cov_hMVSQgH$cf4eVP2BstpviA.s['14']++;
        if ((__cov_hMVSQgH$cf4eVP2BstpviA.b['3'][0]++, config) && (__cov_hMVSQgH$cf4eVP2BstpviA.b['3'][1]++, config.console)) {
            __cov_hMVSQgH$cf4eVP2BstpviA.b['2'][0]++;
            __cov_hMVSQgH$cf4eVP2BstpviA.s['15']++;
            options.transports.push(new Winston.transports.Console(config.console));
        } else {
            __cov_hMVSQgH$cf4eVP2BstpviA.b['2'][1]++;
        }
        __cov_hMVSQgH$cf4eVP2BstpviA.s['16']++;
        if ((__cov_hMVSQgH$cf4eVP2BstpviA.b['5'][0]++, config) && (__cov_hMVSQgH$cf4eVP2BstpviA.b['5'][1]++, config.file)) {
            __cov_hMVSQgH$cf4eVP2BstpviA.b['4'][0]++;
            __cov_hMVSQgH$cf4eVP2BstpviA.s['17']++;
            config.file = defaults(config.file, { filename: './logs/gateway.log' });
            __cov_hMVSQgH$cf4eVP2BstpviA.s['18']++;
            if (StringUtils.startsWith(config.file.filename, '.')) {
                __cov_hMVSQgH$cf4eVP2BstpviA.b['6'][0]++;
                __cov_hMVSQgH$cf4eVP2BstpviA.s['19']++;
                config.file.filename = path.join(gateway.config.rootPath, config.file.filename);
                __cov_hMVSQgH$cf4eVP2BstpviA.s['20']++;
                fs.ensureDirSync(path.dirname(config.file.filename));
            } else {
                __cov_hMVSQgH$cf4eVP2BstpviA.b['6'][1]++;
            }
            __cov_hMVSQgH$cf4eVP2BstpviA.s['21']++;
            options.transports.push(new Winston.transports.File(config.file));
        } else {
            __cov_hMVSQgH$cf4eVP2BstpviA.b['4'][1]++;
        }
        __cov_hMVSQgH$cf4eVP2BstpviA.s['22']++;
        return new Winston.Logger(options);
    };
    __cov_hMVSQgH$cf4eVP2BstpviA.s['23']++;
    Logger.prototype.isDebugEnabled = function () {
        __cov_hMVSQgH$cf4eVP2BstpviA.f['4']++;
        __cov_hMVSQgH$cf4eVP2BstpviA.s['24']++;
        return this.level === gateway_1.LogLevel.debug;
    };
    __cov_hMVSQgH$cf4eVP2BstpviA.s['25']++;
    Logger.prototype.isInfoEnabled = function () {
        __cov_hMVSQgH$cf4eVP2BstpviA.f['5']++;
        __cov_hMVSQgH$cf4eVP2BstpviA.s['26']++;
        return this.level >= gateway_1.LogLevel.info;
    };
    __cov_hMVSQgH$cf4eVP2BstpviA.s['27']++;
    Logger.prototype.isErrorEnabled = function () {
        __cov_hMVSQgH$cf4eVP2BstpviA.f['6']++;
        __cov_hMVSQgH$cf4eVP2BstpviA.s['28']++;
        return this.level >= gateway_1.LogLevel.error;
    };
    __cov_hMVSQgH$cf4eVP2BstpviA.s['29']++;
    Logger.prototype.debug = function () {
        __cov_hMVSQgH$cf4eVP2BstpviA.f['7']++;
        __cov_hMVSQgH$cf4eVP2BstpviA.s['30']++;
        var args = [];
        __cov_hMVSQgH$cf4eVP2BstpviA.s['31']++;
        for (var _i = 0; _i < arguments.length; _i++) {
            __cov_hMVSQgH$cf4eVP2BstpviA.s['32']++;
            args[_i - 0] = arguments[_i];
        }
        __cov_hMVSQgH$cf4eVP2BstpviA.s['33']++;
        this.winston.debug.apply(this, arguments);
    };
    __cov_hMVSQgH$cf4eVP2BstpviA.s['34']++;
    Logger.prototype.info = function () {
        __cov_hMVSQgH$cf4eVP2BstpviA.f['8']++;
        __cov_hMVSQgH$cf4eVP2BstpviA.s['35']++;
        var args = [];
        __cov_hMVSQgH$cf4eVP2BstpviA.s['36']++;
        for (var _i = 0; _i < arguments.length; _i++) {
            __cov_hMVSQgH$cf4eVP2BstpviA.s['37']++;
            args[_i - 0] = arguments[_i];
        }
        __cov_hMVSQgH$cf4eVP2BstpviA.s['38']++;
        this.winston.info.apply(this, arguments);
    };
    __cov_hMVSQgH$cf4eVP2BstpviA.s['39']++;
    Logger.prototype.error = function () {
        __cov_hMVSQgH$cf4eVP2BstpviA.f['9']++;
        __cov_hMVSQgH$cf4eVP2BstpviA.s['40']++;
        var args = [];
        __cov_hMVSQgH$cf4eVP2BstpviA.s['41']++;
        for (var _i = 0; _i < arguments.length; _i++) {
            __cov_hMVSQgH$cf4eVP2BstpviA.s['42']++;
            args[_i - 0] = arguments[_i];
        }
        __cov_hMVSQgH$cf4eVP2BstpviA.s['43']++;
        this.winston.error.apply(this, arguments);
    };
    __cov_hMVSQgH$cf4eVP2BstpviA.s['44']++;
    return Logger;
}();
__cov_hMVSQgH$cf4eVP2BstpviA.s['45']++;
exports.Logger = Logger;

//# sourceMappingURL=logger.js.map
