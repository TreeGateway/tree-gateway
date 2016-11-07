"use strict";
var __cov_ayfO3O$dVYChbMHpc4zlGQ = (Function('return this'))();
if (!__cov_ayfO3O$dVYChbMHpc4zlGQ.$$cov_1478494487039$$) { __cov_ayfO3O$dVYChbMHpc4zlGQ.$$cov_1478494487039$$ = {}; }
__cov_ayfO3O$dVYChbMHpc4zlGQ = __cov_ayfO3O$dVYChbMHpc4zlGQ.$$cov_1478494487039$$;
if (!(__cov_ayfO3O$dVYChbMHpc4zlGQ['/Users/thiago/git/tree-gateway/bin/lib/authentication/auth.js'])) {
   __cov_ayfO3O$dVYChbMHpc4zlGQ['/Users/thiago/git/tree-gateway/bin/lib/authentication/auth.js'] = {"path":"/Users/thiago/git/tree-gateway/bin/lib/authentication/auth.js","s":{"1":0,"2":0,"3":0,"4":0,"5":0,"6":1,"7":0,"8":0,"9":0,"10":0,"11":0,"12":0,"13":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0,"24":0},"b":{"1":[0,0],"2":[0,0]},"f":{"1":0,"2":0,"3":0,"4":0},"fnMap":{"1":{"name":"(anonymous_1)","line":10,"loc":{"start":{"line":10,"column":15},"end":{"line":10,"column":27}}},"2":{"name":"ApiAuth","line":11,"loc":{"start":{"line":11,"column":4},"end":{"line":11,"column":30}}},"3":{"name":"(anonymous_3)","line":14,"loc":{"start":{"line":14,"column":39},"end":{"line":14,"column":79}}},"4":{"name":"(anonymous_4)","line":16,"loc":{"start":{"line":16,"column":43},"end":{"line":16,"column":58}}}},"statementMap":{"1":{"start":{"line":2,"column":0},"end":{"line":2,"column":34}},"2":{"start":{"line":3,"column":0},"end":{"line":3,"column":31}},"3":{"start":{"line":4,"column":0},"end":{"line":4,"column":31}},"4":{"start":{"line":5,"column":0},"end":{"line":9,"column":2}},"5":{"start":{"line":10,"column":0},"end":{"line":39,"column":5}},"6":{"start":{"line":11,"column":4},"end":{"line":13,"column":5}},"7":{"start":{"line":12,"column":8},"end":{"line":12,"column":31}},"8":{"start":{"line":14,"column":4},"end":{"line":37,"column":6}},"9":{"start":{"line":15,"column":8},"end":{"line":15,"column":25}},"10":{"start":{"line":16,"column":8},"end":{"line":36,"column":11}},"11":{"start":{"line":17,"column":12},"end":{"line":35,"column":13}},"12":{"start":{"line":18,"column":16},"end":{"line":18,"column":53}},"13":{"start":{"line":19,"column":16},"end":{"line":27,"column":17}},"14":{"start":{"line":20,"column":20},"end":{"line":20,"column":59}},"15":{"start":{"line":21,"column":20},"end":{"line":21,"column":64}},"16":{"start":{"line":24,"column":20},"end":{"line":24,"column":109}},"17":{"start":{"line":25,"column":20},"end":{"line":25,"column":46}},"18":{"start":{"line":26,"column":20},"end":{"line":26,"column":49}},"19":{"start":{"line":28,"column":16},"end":{"line":28,"column":94}},"20":{"start":{"line":29,"column":16},"end":{"line":31,"column":17}},"21":{"start":{"line":30,"column":20},"end":{"line":30,"column":115}},"22":{"start":{"line":34,"column":16},"end":{"line":34,"column":121}},"23":{"start":{"line":38,"column":4},"end":{"line":38,"column":19}},"24":{"start":{"line":40,"column":0},"end":{"line":40,"column":26}}},"branchMap":{"1":{"line":19,"type":"if","locations":[{"start":{"line":19,"column":16},"end":{"line":19,"column":16}},{"start":{"line":19,"column":16},"end":{"line":19,"column":16}}]},"2":{"line":29,"type":"if","locations":[{"start":{"line":29,"column":16},"end":{"line":29,"column":16}},{"start":{"line":29,"column":16},"end":{"line":29,"column":16}}]}}};
}
__cov_ayfO3O$dVYChbMHpc4zlGQ = __cov_ayfO3O$dVYChbMHpc4zlGQ['/Users/thiago/git/tree-gateway/bin/lib/authentication/auth.js'];
__cov_ayfO3O$dVYChbMHpc4zlGQ.s['1']++;
var Utils = require('underscore');
__cov_ayfO3O$dVYChbMHpc4zlGQ.s['2']++;
var pathUtil = require('path');
__cov_ayfO3O$dVYChbMHpc4zlGQ.s['3']++;
var auth = require('passport');
__cov_ayfO3O$dVYChbMHpc4zlGQ.s['4']++;
var providedStrategies = {
    'jwt': require('./strategies/jwt'),
    'basic': require('./strategies/basic'),
    'local': require('./strategies/local')
};
__cov_ayfO3O$dVYChbMHpc4zlGQ.s['5']++;
var ApiAuth = function () {
    __cov_ayfO3O$dVYChbMHpc4zlGQ.f['1']++;
    function ApiAuth(gateway) {
        __cov_ayfO3O$dVYChbMHpc4zlGQ.f['2']++;
        __cov_ayfO3O$dVYChbMHpc4zlGQ.s['7']++;
        this.gateway = gateway;
    }
    __cov_ayfO3O$dVYChbMHpc4zlGQ.s['8']++;
    ApiAuth.prototype.authentication = function (apiKey, path, authentication) {
        __cov_ayfO3O$dVYChbMHpc4zlGQ.f['3']++;
        __cov_ayfO3O$dVYChbMHpc4zlGQ.s['9']++;
        var _this = this;
        __cov_ayfO3O$dVYChbMHpc4zlGQ.s['10']++;
        Utils.keys(authentication).forEach(function (key) {
            __cov_ayfO3O$dVYChbMHpc4zlGQ.f['4']++;
            __cov_ayfO3O$dVYChbMHpc4zlGQ.s['11']++;
            try {
                __cov_ayfO3O$dVYChbMHpc4zlGQ.s['12']++;
                var authConfig = authentication[key];
                __cov_ayfO3O$dVYChbMHpc4zlGQ.s['13']++;
                if (Utils.has(providedStrategies, key)) {
                    __cov_ayfO3O$dVYChbMHpc4zlGQ.b['1'][0]++;
                    __cov_ayfO3O$dVYChbMHpc4zlGQ.s['14']++;
                    var strategy = providedStrategies[key];
                    __cov_ayfO3O$dVYChbMHpc4zlGQ.s['15']++;
                    strategy(apiKey, authConfig, _this.gateway);
                } else {
                    __cov_ayfO3O$dVYChbMHpc4zlGQ.b['1'][1]++;
                    __cov_ayfO3O$dVYChbMHpc4zlGQ.s['16']++;
                    var p = pathUtil.join(_this.gateway.middlewarePath, 'authentication', 'strategies', key);
                    __cov_ayfO3O$dVYChbMHpc4zlGQ.s['17']++;
                    var strategy = require(p);
                    __cov_ayfO3O$dVYChbMHpc4zlGQ.s['18']++;
                    strategy(apiKey, authConfig);
                }
                __cov_ayfO3O$dVYChbMHpc4zlGQ.s['19']++;
                _this.gateway.server.use(path, auth.authenticate(apiKey, { session: false }));
                __cov_ayfO3O$dVYChbMHpc4zlGQ.s['20']++;
                if (_this.gateway.logger.isDebugEnabled) {
                    __cov_ayfO3O$dVYChbMHpc4zlGQ.b['2'][0]++;
                    __cov_ayfO3O$dVYChbMHpc4zlGQ.s['21']++;
                    _this.gateway.logger.debug('Authentication Strategy [%s] configured for path [%s]', key, path);
                } else {
                    __cov_ayfO3O$dVYChbMHpc4zlGQ.b['2'][1]++;
                }
            } catch (e) {
                __cov_ayfO3O$dVYChbMHpc4zlGQ.s['22']++;
                _this.gateway.logger.error('Error configuring Authentication Strategy [%s] for path [%s]', key, path, e);
            }
        });
    };
    __cov_ayfO3O$dVYChbMHpc4zlGQ.s['23']++;
    return ApiAuth;
}();
__cov_ayfO3O$dVYChbMHpc4zlGQ.s['24']++;
exports.ApiAuth = ApiAuth;

//# sourceMappingURL=auth.js.map
