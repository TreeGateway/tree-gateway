"use strict";
var __cov_G6VipiIJjR3VCNcFiPZqNQ = (Function('return this'))();
if (!__cov_G6VipiIJjR3VCNcFiPZqNQ.$$cov_1478225508621$$) { __cov_G6VipiIJjR3VCNcFiPZqNQ.$$cov_1478225508621$$ = {}; }
__cov_G6VipiIJjR3VCNcFiPZqNQ = __cov_G6VipiIJjR3VCNcFiPZqNQ.$$cov_1478225508621$$;
if (!(__cov_G6VipiIJjR3VCNcFiPZqNQ['/Users/thiago/git/tree-gateway/bin/lib/proxy/utils.js'])) {
   __cov_G6VipiIJjR3VCNcFiPZqNQ['/Users/thiago/git/tree-gateway/bin/lib/proxy/utils.js'] = {"path":"/Users/thiago/git/tree-gateway/bin/lib/proxy/utils.js","s":{"1":0,"2":1,"3":0,"4":0,"5":0,"6":0},"b":{"1":[0,0],"2":[0,0]},"f":{"1":0},"fnMap":{"1":{"name":"normalizePath","line":3,"loc":{"start":{"line":3,"column":0},"end":{"line":3,"column":29}}}},"statementMap":{"1":{"start":{"line":2,"column":0},"end":{"line":2,"column":47}},"2":{"start":{"line":3,"column":0},"end":{"line":7,"column":1}},"3":{"start":{"line":4,"column":4},"end":{"line":4,"column":69}},"4":{"start":{"line":5,"column":4},"end":{"line":5,"column":67}},"5":{"start":{"line":6,"column":4},"end":{"line":6,"column":16}},"6":{"start":{"line":8,"column":0},"end":{"line":8,"column":38}}},"branchMap":{"1":{"line":4,"type":"cond-expr","locations":[{"start":{"line":4,"column":50},"end":{"line":4,"column":54}},{"start":{"line":4,"column":57},"end":{"line":4,"column":67}}]},"2":{"line":5,"type":"cond-expr","locations":[{"start":{"line":5,"column":48},"end":{"line":5,"column":52}},{"start":{"line":5,"column":55},"end":{"line":5,"column":65}}]}}};
}
__cov_G6VipiIJjR3VCNcFiPZqNQ = __cov_G6VipiIJjR3VCNcFiPZqNQ['/Users/thiago/git/tree-gateway/bin/lib/proxy/utils.js'];
__cov_G6VipiIJjR3VCNcFiPZqNQ.s['1']++;
var StringUtils = require('underscore.string');
function normalizePath(path) {
    __cov_G6VipiIJjR3VCNcFiPZqNQ.f['1']++;
    __cov_G6VipiIJjR3VCNcFiPZqNQ.s['3']++;
    path = StringUtils.startsWith(path, '/') ? (__cov_G6VipiIJjR3VCNcFiPZqNQ.b['1'][0]++, path) : (__cov_G6VipiIJjR3VCNcFiPZqNQ.b['1'][1]++, '/' + path);
    __cov_G6VipiIJjR3VCNcFiPZqNQ.s['4']++;
    path = StringUtils.endsWith(path, '/') ? (__cov_G6VipiIJjR3VCNcFiPZqNQ.b['2'][0]++, path) : (__cov_G6VipiIJjR3VCNcFiPZqNQ.b['2'][1]++, path + '/');
    __cov_G6VipiIJjR3VCNcFiPZqNQ.s['5']++;
    return path;
}
__cov_G6VipiIJjR3VCNcFiPZqNQ.s['6']++;
exports.normalizePath = normalizePath;

//# sourceMappingURL=utils.js.map
