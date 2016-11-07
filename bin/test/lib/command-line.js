"use strict";
var __cov_STzn09wDKuqbdUFjZx4JYQ = (Function('return this'))();
if (!__cov_STzn09wDKuqbdUFjZx4JYQ.$$cov_1478541281104$$) { __cov_STzn09wDKuqbdUFjZx4JYQ.$$cov_1478541281104$$ = {}; }
__cov_STzn09wDKuqbdUFjZx4JYQ = __cov_STzn09wDKuqbdUFjZx4JYQ.$$cov_1478541281104$$;
if (!(__cov_STzn09wDKuqbdUFjZx4JYQ['/Users/thiago/git/tree-gateway/bin/lib/command-line.js'])) {
   __cov_STzn09wDKuqbdUFjZx4JYQ['/Users/thiago/git/tree-gateway/bin/lib/command-line.js'] = {"path":"/Users/thiago/git/tree-gateway/bin/lib/command-line.js","s":{"1":0,"2":0,"3":0,"4":0,"5":1,"6":0,"7":0,"8":0},"b":{},"f":{"1":0,"2":0},"fnMap":{"1":{"name":"(anonymous_1)","line":7,"loc":{"start":{"line":7,"column":18},"end":{"line":7,"column":30}}},"2":{"name":"Parameters","line":8,"loc":{"start":{"line":8,"column":4},"end":{"line":8,"column":26}}}},"statementMap":{"1":{"start":{"line":2,"column":0},"end":{"line":2,"column":27}},"2":{"start":{"line":3,"column":0},"end":{"line":3,"column":27}},"3":{"start":{"line":4,"column":0},"end":{"line":6,"column":25}},"4":{"start":{"line":7,"column":0},"end":{"line":11,"column":5}},"5":{"start":{"line":8,"column":4},"end":{"line":9,"column":5}},"6":{"start":{"line":10,"column":4},"end":{"line":10,"column":22}},"7":{"start":{"line":12,"column":0},"end":{"line":12,"column":32}},"8":{"start":{"line":13,"column":0},"end":{"line":13,"column":49}}},"branchMap":{}};
}
__cov_STzn09wDKuqbdUFjZx4JYQ = __cov_STzn09wDKuqbdUFjZx4JYQ['/Users/thiago/git/tree-gateway/bin/lib/command-line.js'];
__cov_STzn09wDKuqbdUFjZx4JYQ.s['1']++;
var path = require('path');
__cov_STzn09wDKuqbdUFjZx4JYQ.s['2']++;
var args = require('args');
__cov_STzn09wDKuqbdUFjZx4JYQ.s['3']++;
var parameters = args.option('config', 'The Tree-Gateway config file (tree-gateway.json).', path.join(process.cwd(), 'tree-gateway.json')).parse(process.argv);
__cov_STzn09wDKuqbdUFjZx4JYQ.s['4']++;
var Parameters = function () {
    __cov_STzn09wDKuqbdUFjZx4JYQ.f['1']++;
    function Parameters() {
        __cov_STzn09wDKuqbdUFjZx4JYQ.f['2']++;
    }
    __cov_STzn09wDKuqbdUFjZx4JYQ.s['6']++;
    return Parameters;
}();
__cov_STzn09wDKuqbdUFjZx4JYQ.s['7']++;
exports.Parameters = Parameters;
__cov_STzn09wDKuqbdUFjZx4JYQ.s['8']++;
Parameters.gatewayConfigFile = parameters.config;

//# sourceMappingURL=command-line.js.map
