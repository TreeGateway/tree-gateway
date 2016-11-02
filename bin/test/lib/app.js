"use strict";
var __cov_Jik9dObhExao7pXak0WMrA = (Function('return this'))();
if (!__cov_Jik9dObhExao7pXak0WMrA.$$cov_1478046085583$$) { __cov_Jik9dObhExao7pXak0WMrA.$$cov_1478046085583$$ = {}; }
__cov_Jik9dObhExao7pXak0WMrA = __cov_Jik9dObhExao7pXak0WMrA.$$cov_1478046085583$$;
if (!(__cov_Jik9dObhExao7pXak0WMrA['/Users/thiago/git/tree-gateway/bin/lib/app.js'])) {
   __cov_Jik9dObhExao7pXak0WMrA['/Users/thiago/git/tree-gateway/bin/lib/app.js'] = {"path":"/Users/thiago/git/tree-gateway/bin/lib/app.js","s":{"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0,"8":0,"9":0,"10":0,"11":0,"12":0,"13":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0},"b":{"1":[0,0]},"f":{"1":0,"2":0},"fnMap":{"1":{"name":"(anonymous_1)","line":17,"loc":{"start":{"line":17,"column":14},"end":{"line":17,"column":34}}},"2":{"name":"(anonymous_2)","line":26,"loc":{"start":{"line":26,"column":43},"end":{"line":26,"column":55}}}},"statementMap":{"1":{"start":{"line":2,"column":0},"end":{"line":2,"column":31}},"2":{"start":{"line":3,"column":0},"end":{"line":3,"column":37}},"3":{"start":{"line":4,"column":0},"end":{"line":4,"column":29}},"4":{"start":{"line":5,"column":0},"end":{"line":5,"column":33}},"5":{"start":{"line":6,"column":0},"end":{"line":6,"column":49}},"6":{"start":{"line":7,"column":0},"end":{"line":7,"column":41}},"7":{"start":{"line":8,"column":0},"end":{"line":8,"column":47}},"8":{"start":{"line":9,"column":0},"end":{"line":9,"column":27}},"9":{"start":{"line":10,"column":0},"end":{"line":10,"column":64}},"10":{"start":{"line":11,"column":0},"end":{"line":11,"column":25}},"11":{"start":{"line":12,"column":0},"end":{"line":12,"column":28}},"12":{"start":{"line":13,"column":0},"end":{"line":13,"column":23}},"13":{"start":{"line":14,"column":0},"end":{"line":24,"column":1}},"14":{"start":{"line":15,"column":4},"end":{"line":15,"column":135}},"15":{"start":{"line":16,"column":4},"end":{"line":20,"column":36}},"16":{"start":{"line":18,"column":12},"end":{"line":18,"column":40}},"17":{"start":{"line":23,"column":4},"end":{"line":23,"column":27}},"18":{"start":{"line":25,"column":0},"end":{"line":25,"column":21}},"19":{"start":{"line":26,"column":0},"end":{"line":28,"column":3}},"20":{"start":{"line":27,"column":4},"end":{"line":27,"column":79}},"21":{"start":{"line":29,"column":0},"end":{"line":29,"column":21}}},"branchMap":{"1":{"line":14,"type":"if","locations":[{"start":{"line":14,"column":0},"end":{"line":14,"column":0}},{"start":{"line":14,"column":0},"end":{"line":14,"column":0}}]}}};
}
__cov_Jik9dObhExao7pXak0WMrA = __cov_Jik9dObhExao7pXak0WMrA['/Users/thiago/git/tree-gateway/bin/lib/app.js'];
__cov_Jik9dObhExao7pXak0WMrA.s['1']++;
var logger = require('morgan');
__cov_Jik9dObhExao7pXak0WMrA.s['2']++;
var gateway_1 = require('./gateway');
__cov_Jik9dObhExao7pXak0WMrA.s['3']++;
var fs = require('fs-extra');
__cov_Jik9dObhExao7pXak0WMrA.s['4']++;
var winston = require('winston');
__cov_Jik9dObhExao7pXak0WMrA.s['5']++;
var typescript_ioc_1 = require('typescript-ioc');
__cov_Jik9dObhExao7pXak0WMrA.s['6']++;
var compression = require('compression');
__cov_Jik9dObhExao7pXak0WMrA.s['7']++;
var command_line_1 = require('./command-line');
__cov_Jik9dObhExao7pXak0WMrA.s['8']++;
var path = require('path');
__cov_Jik9dObhExao7pXak0WMrA.s['9']++;
var gateway = typescript_ioc_1.Container.get(gateway_1.Gateway);
__cov_Jik9dObhExao7pXak0WMrA.s['10']++;
var app = gateway.server;
__cov_Jik9dObhExao7pXak0WMrA.s['11']++;
app.disable('x-powered-by');
__cov_Jik9dObhExao7pXak0WMrA.s['12']++;
app.use(compression());
__cov_Jik9dObhExao7pXak0WMrA.s['13']++;
if (app.get('env') == 'production') {
    __cov_Jik9dObhExao7pXak0WMrA.b['1'][0]++;
    __cov_Jik9dObhExao7pXak0WMrA.s['14']++;
    var accessLogStream = fs.createWriteStream(path.join(command_line_1.Parameters.rootDir, 'logs/access_errors.log'), { flags: 'a' });
    __cov_Jik9dObhExao7pXak0WMrA.s['15']++;
    app.use(logger('common', {
        skip: function (req, res) {
            __cov_Jik9dObhExao7pXak0WMrA.f['1']++;
            __cov_Jik9dObhExao7pXak0WMrA.s['16']++;
            return res.statusCode < 400;
        },
        stream: accessLogStream
    }));
} else {
    __cov_Jik9dObhExao7pXak0WMrA.b['1'][1]++;
    __cov_Jik9dObhExao7pXak0WMrA.s['17']++;
    app.use(logger('dev'));
}
__cov_Jik9dObhExao7pXak0WMrA.s['18']++;
gateway.initialize();
__cov_Jik9dObhExao7pXak0WMrA.s['19']++;
app.listen(command_line_1.Parameters.port, function () {
    __cov_Jik9dObhExao7pXak0WMrA.f['2']++;
    __cov_Jik9dObhExao7pXak0WMrA.s['20']++;
    winston.info('Gateway listenning port %d', command_line_1.Parameters.port);
});
__cov_Jik9dObhExao7pXak0WMrA.s['21']++;
module.exports = app;

//# sourceMappingURL=app.js.map
