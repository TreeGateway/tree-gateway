"use strict";
var __cov_STzn09wDKuqbdUFjZx4JYQ = (Function('return this'))();
if (!__cov_STzn09wDKuqbdUFjZx4JYQ.$$cov_1478202055487$$) { __cov_STzn09wDKuqbdUFjZx4JYQ.$$cov_1478202055487$$ = {}; }
__cov_STzn09wDKuqbdUFjZx4JYQ = __cov_STzn09wDKuqbdUFjZx4JYQ.$$cov_1478202055487$$;
if (!(__cov_STzn09wDKuqbdUFjZx4JYQ['/Users/thiago/git/tree-gateway/bin/lib/command-line.js'])) {
   __cov_STzn09wDKuqbdUFjZx4JYQ['/Users/thiago/git/tree-gateway/bin/lib/command-line.js'] = {"path":"/Users/thiago/git/tree-gateway/bin/lib/command-line.js","s":{"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0,"8":0,"9":0,"10":1,"11":0,"12":0,"13":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0,"24":0,"25":0},"b":{"1":[0,0]},"f":{"1":0,"2":0,"3":0},"fnMap":{"1":{"name":"(anonymous_1)","line":14,"loc":{"start":{"line":14,"column":18},"end":{"line":14,"column":30}}},"2":{"name":"Parameters","line":15,"loc":{"start":{"line":15,"column":4},"end":{"line":15,"column":26}}},"3":{"name":"(anonymous_3)","line":27,"loc":{"start":{"line":27,"column":9},"end":{"line":27,"column":21}}}},"statementMap":{"1":{"start":{"line":2,"column":0},"end":{"line":2,"column":33}},"2":{"start":{"line":3,"column":0},"end":{"line":3,"column":33}},"3":{"start":{"line":4,"column":0},"end":{"line":4,"column":44}},"4":{"start":{"line":5,"column":0},"end":{"line":5,"column":27}},"5":{"start":{"line":6,"column":0},"end":{"line":6,"column":47}},"6":{"start":{"line":7,"column":0},"end":{"line":7,"column":49}},"7":{"start":{"line":8,"column":0},"end":{"line":8,"column":27}},"8":{"start":{"line":9,"column":0},"end":{"line":13,"column":25}},"9":{"start":{"line":14,"column":0},"end":{"line":18,"column":5}},"10":{"start":{"line":15,"column":4},"end":{"line":16,"column":5}},"11":{"start":{"line":17,"column":4},"end":{"line":17,"column":22}},"12":{"start":{"line":19,"column":0},"end":{"line":19,"column":32}},"13":{"start":{"line":20,"column":0},"end":{"line":20,"column":36}},"14":{"start":{"line":21,"column":0},"end":{"line":21,"column":34}},"15":{"start":{"line":22,"column":0},"end":{"line":22,"column":44}},"16":{"start":{"line":23,"column":0},"end":{"line":25,"column":1}},"17":{"start":{"line":24,"column":4},"end":{"line":24,"column":70}},"18":{"start":{"line":26,"column":0},"end":{"line":34,"column":2}},"19":{"start":{"line":28,"column":8},"end":{"line":28,"column":49}},"20":{"start":{"line":29,"column":8},"end":{"line":29,"column":33}},"21":{"start":{"line":30,"column":8},"end":{"line":30,"column":65}},"22":{"start":{"line":31,"column":8},"end":{"line":31,"column":78}},"23":{"start":{"line":32,"column":8},"end":{"line":32,"column":24}},"24":{"start":{"line":35,"column":0},"end":{"line":35,"column":72}},"25":{"start":{"line":36,"column":0},"end":{"line":36,"column":102}}},"branchMap":{"1":{"line":23,"type":"if","locations":[{"start":{"line":23,"column":0},"end":{"line":23,"column":0}},{"start":{"line":23,"column":0},"end":{"line":23,"column":0}}]}}};
}
__cov_STzn09wDKuqbdUFjZx4JYQ = __cov_STzn09wDKuqbdUFjZx4JYQ['/Users/thiago/git/tree-gateway/bin/lib/command-line.js'];
__cov_STzn09wDKuqbdUFjZx4JYQ.s['1']++;
var express = require('express');
__cov_STzn09wDKuqbdUFjZx4JYQ.s['2']++;
var winston = require('winston');
__cov_STzn09wDKuqbdUFjZx4JYQ.s['3']++;
var settings_1 = require('../lib/settings');
__cov_STzn09wDKuqbdUFjZx4JYQ.s['4']++;
var path = require('path');
__cov_STzn09wDKuqbdUFjZx4JYQ.s['5']++;
var StringUtils = require('underscore.string');
__cov_STzn09wDKuqbdUFjZx4JYQ.s['6']++;
var typescript_ioc_1 = require('typescript-ioc');
__cov_STzn09wDKuqbdUFjZx4JYQ.s['7']++;
var args = require('args');
__cov_STzn09wDKuqbdUFjZx4JYQ.s['8']++;
var parameters = args.option('dir', 'The root directory where apis and middlewares are placed.', __dirname).option('port', 'The gateway listen port.', 8000).option('adminPort', 'The gateway admin server listen port.', 8001).parse(process.argv);
__cov_STzn09wDKuqbdUFjZx4JYQ.s['9']++;
var Parameters = function () {
    __cov_STzn09wDKuqbdUFjZx4JYQ.f['1']++;
    function Parameters() {
        __cov_STzn09wDKuqbdUFjZx4JYQ.f['2']++;
    }
    __cov_STzn09wDKuqbdUFjZx4JYQ.s['11']++;
    return Parameters;
}();
__cov_STzn09wDKuqbdUFjZx4JYQ.s['12']++;
exports.Parameters = Parameters;
__cov_STzn09wDKuqbdUFjZx4JYQ.s['13']++;
Parameters.rootDir = parameters.dir;
__cov_STzn09wDKuqbdUFjZx4JYQ.s['14']++;
Parameters.port = parameters.port;
__cov_STzn09wDKuqbdUFjZx4JYQ.s['15']++;
Parameters.adminPort = parameters.adminPort;
__cov_STzn09wDKuqbdUFjZx4JYQ.s['16']++;
if (StringUtils.startsWith(Parameters.rootDir, '.')) {
    __cov_STzn09wDKuqbdUFjZx4JYQ.b['1'][0]++;
    __cov_STzn09wDKuqbdUFjZx4JYQ.s['17']++;
    Parameters.rootDir = path.join(process.cwd(), Parameters.rootDir);
} else {
    __cov_STzn09wDKuqbdUFjZx4JYQ.b['1'][1]++;
}
__cov_STzn09wDKuqbdUFjZx4JYQ.s['18']++;
var provider = {
    get: function () {
        __cov_STzn09wDKuqbdUFjZx4JYQ.f['3']++;
        __cov_STzn09wDKuqbdUFjZx4JYQ.s['19']++;
        var settings = new settings_1.Settings();
        __cov_STzn09wDKuqbdUFjZx4JYQ.s['20']++;
        settings.app = express();
        __cov_STzn09wDKuqbdUFjZx4JYQ.s['21']++;
        settings.apiPath = path.join(Parameters.rootDir, 'apis');
        __cov_STzn09wDKuqbdUFjZx4JYQ.s['22']++;
        settings.middlewarePath = path.join(Parameters.rootDir, 'middleware');
        __cov_STzn09wDKuqbdUFjZx4JYQ.s['23']++;
        return settings;
    }
};
__cov_STzn09wDKuqbdUFjZx4JYQ.s['24']++;
typescript_ioc_1.Container.bind(settings_1.Settings).provider(provider);
__cov_STzn09wDKuqbdUFjZx4JYQ.s['25']++;
winston.add(winston.transports.File, { filename: path.join(Parameters.rootDir, 'logs/gateway.log') });

//# sourceMappingURL=command-line.js.map
