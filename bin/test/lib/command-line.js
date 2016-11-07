"use strict";
var __cov_STzn09wDKuqbdUFjZx4JYQ = (Function('return this'))();
if (!__cov_STzn09wDKuqbdUFjZx4JYQ.$$cov_1478494487039$$) { __cov_STzn09wDKuqbdUFjZx4JYQ.$$cov_1478494487039$$ = {}; }
__cov_STzn09wDKuqbdUFjZx4JYQ = __cov_STzn09wDKuqbdUFjZx4JYQ.$$cov_1478494487039$$;
if (!(__cov_STzn09wDKuqbdUFjZx4JYQ['/Users/thiago/git/tree-gateway/bin/lib/command-line.js'])) {
   __cov_STzn09wDKuqbdUFjZx4JYQ['/Users/thiago/git/tree-gateway/bin/lib/command-line.js'] = {"path":"/Users/thiago/git/tree-gateway/bin/lib/command-line.js","s":{"1":0,"2":0,"3":0,"4":0,"5":0,"6":1,"7":0,"8":0,"9":0,"10":0,"11":0,"12":0,"13":0},"b":{"1":[0,0]},"f":{"1":0,"2":0},"fnMap":{"1":{"name":"(anonymous_1)","line":10,"loc":{"start":{"line":10,"column":18},"end":{"line":10,"column":30}}},"2":{"name":"Parameters","line":11,"loc":{"start":{"line":11,"column":4},"end":{"line":11,"column":26}}}},"statementMap":{"1":{"start":{"line":2,"column":0},"end":{"line":2,"column":27}},"2":{"start":{"line":3,"column":0},"end":{"line":3,"column":47}},"3":{"start":{"line":4,"column":0},"end":{"line":4,"column":27}},"4":{"start":{"line":5,"column":0},"end":{"line":9,"column":25}},"5":{"start":{"line":10,"column":0},"end":{"line":14,"column":5}},"6":{"start":{"line":11,"column":4},"end":{"line":12,"column":5}},"7":{"start":{"line":13,"column":4},"end":{"line":13,"column":22}},"8":{"start":{"line":15,"column":0},"end":{"line":15,"column":32}},"9":{"start":{"line":16,"column":0},"end":{"line":16,"column":36}},"10":{"start":{"line":17,"column":0},"end":{"line":17,"column":34}},"11":{"start":{"line":18,"column":0},"end":{"line":18,"column":44}},"12":{"start":{"line":19,"column":0},"end":{"line":21,"column":1}},"13":{"start":{"line":20,"column":4},"end":{"line":20,"column":70}}},"branchMap":{"1":{"line":19,"type":"if","locations":[{"start":{"line":19,"column":0},"end":{"line":19,"column":0}},{"start":{"line":19,"column":0},"end":{"line":19,"column":0}}]}}};
}
__cov_STzn09wDKuqbdUFjZx4JYQ = __cov_STzn09wDKuqbdUFjZx4JYQ['/Users/thiago/git/tree-gateway/bin/lib/command-line.js'];
__cov_STzn09wDKuqbdUFjZx4JYQ.s['1']++;
var path = require('path');
__cov_STzn09wDKuqbdUFjZx4JYQ.s['2']++;
var StringUtils = require('underscore.string');
__cov_STzn09wDKuqbdUFjZx4JYQ.s['3']++;
var args = require('args');
__cov_STzn09wDKuqbdUFjZx4JYQ.s['4']++;
var parameters = args.option('dir', 'The root directory where apis and middlewares are placed.', __dirname).option('port', 'The gateway listen port.', 8000).option('adminPort', 'The gateway admin server listen port.', 8001).parse(process.argv);
__cov_STzn09wDKuqbdUFjZx4JYQ.s['5']++;
var Parameters = function () {
    __cov_STzn09wDKuqbdUFjZx4JYQ.f['1']++;
    function Parameters() {
        __cov_STzn09wDKuqbdUFjZx4JYQ.f['2']++;
    }
    __cov_STzn09wDKuqbdUFjZx4JYQ.s['7']++;
    return Parameters;
}();
__cov_STzn09wDKuqbdUFjZx4JYQ.s['8']++;
exports.Parameters = Parameters;
__cov_STzn09wDKuqbdUFjZx4JYQ.s['9']++;
Parameters.rootDir = parameters.dir;
__cov_STzn09wDKuqbdUFjZx4JYQ.s['10']++;
Parameters.port = parameters.port;
__cov_STzn09wDKuqbdUFjZx4JYQ.s['11']++;
Parameters.adminPort = parameters.adminPort;
__cov_STzn09wDKuqbdUFjZx4JYQ.s['12']++;
if (StringUtils.startsWith(Parameters.rootDir, '.')) {
    __cov_STzn09wDKuqbdUFjZx4JYQ.b['1'][0]++;
    __cov_STzn09wDKuqbdUFjZx4JYQ.s['13']++;
    Parameters.rootDir = path.join(process.cwd(), Parameters.rootDir);
} else {
    __cov_STzn09wDKuqbdUFjZx4JYQ.b['1'][1]++;
}

//# sourceMappingURL=command-line.js.map
