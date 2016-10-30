"use strict";
var __cov_Jik9dObhExao7pXak0WMrA = (Function('return this'))();
if (!__cov_Jik9dObhExao7pXak0WMrA.$$cov_1477793653609$$) { __cov_Jik9dObhExao7pXak0WMrA.$$cov_1477793653609$$ = {}; }
__cov_Jik9dObhExao7pXak0WMrA = __cov_Jik9dObhExao7pXak0WMrA.$$cov_1477793653609$$;
if (!(__cov_Jik9dObhExao7pXak0WMrA['/Users/thiago/git/tree-gateway/bin/lib/app.js'])) {
   __cov_Jik9dObhExao7pXak0WMrA['/Users/thiago/git/tree-gateway/bin/lib/app.js'] = {"path":"/Users/thiago/git/tree-gateway/bin/lib/app.js","s":{"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0,"8":0,"9":0,"10":0,"11":0,"12":0,"13":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0,"24":0,"25":0,"26":0,"27":0,"28":0,"29":0,"30":0,"31":0,"32":0,"33":0,"34":0,"35":0},"b":{"1":[0,0],"2":[0,0],"3":[0,0]},"f":{"1":0,"2":0},"fnMap":{"1":{"name":"(anonymous_1)","line":19,"loc":{"start":{"line":19,"column":13},"end":{"line":19,"column":25}}},"2":{"name":"(anonymous_2)","line":37,"loc":{"start":{"line":37,"column":14},"end":{"line":37,"column":34}}}},"statementMap":{"1":{"start":{"line":2,"column":0},"end":{"line":2,"column":33}},"2":{"start":{"line":3,"column":0},"end":{"line":3,"column":31}},"3":{"start":{"line":4,"column":0},"end":{"line":4,"column":37}},"4":{"start":{"line":5,"column":0},"end":{"line":5,"column":29}},"5":{"start":{"line":6,"column":0},"end":{"line":6,"column":33}},"6":{"start":{"line":7,"column":0},"end":{"line":7,"column":49}},"7":{"start":{"line":8,"column":0},"end":{"line":8,"column":41}},"8":{"start":{"line":9,"column":0},"end":{"line":9,"column":44}},"9":{"start":{"line":10,"column":0},"end":{"line":10,"column":27}},"10":{"start":{"line":11,"column":0},"end":{"line":11,"column":47}},"11":{"start":{"line":12,"column":0},"end":{"line":12,"column":24}},"12":{"start":{"line":13,"column":0},"end":{"line":28,"column":1}},"13":{"start":{"line":14,"column":4},"end":{"line":14,"column":30}},"14":{"start":{"line":15,"column":4},"end":{"line":17,"column":5}},"15":{"start":{"line":16,"column":8},"end":{"line":16,"column":52}},"16":{"start":{"line":18,"column":4},"end":{"line":26,"column":6}},"17":{"start":{"line":20,"column":12},"end":{"line":20,"column":53}},"18":{"start":{"line":21,"column":12},"end":{"line":21,"column":37}},"19":{"start":{"line":22,"column":12},"end":{"line":22,"column":58}},"20":{"start":{"line":23,"column":12},"end":{"line":23,"column":71}},"21":{"start":{"line":24,"column":12},"end":{"line":24,"column":28}},"22":{"start":{"line":27,"column":4},"end":{"line":27,"column":76}},"23":{"start":{"line":29,"column":0},"end":{"line":29,"column":91}},"24":{"start":{"line":30,"column":0},"end":{"line":30,"column":64}},"25":{"start":{"line":31,"column":0},"end":{"line":31,"column":25}},"26":{"start":{"line":32,"column":0},"end":{"line":32,"column":28}},"27":{"start":{"line":33,"column":0},"end":{"line":33,"column":23}},"28":{"start":{"line":34,"column":0},"end":{"line":44,"column":1}},"29":{"start":{"line":35,"column":4},"end":{"line":35,"column":109}},"30":{"start":{"line":36,"column":4},"end":{"line":40,"column":36}},"31":{"start":{"line":38,"column":12},"end":{"line":38,"column":40}},"32":{"start":{"line":43,"column":4},"end":{"line":43,"column":27}},"33":{"start":{"line":45,"column":0},"end":{"line":45,"column":21}},"34":{"start":{"line":46,"column":0},"end":{"line":46,"column":17}},"35":{"start":{"line":47,"column":0},"end":{"line":47,"column":21}}},"branchMap":{"1":{"line":13,"type":"if","locations":[{"start":{"line":13,"column":0},"end":{"line":13,"column":0}},{"start":{"line":13,"column":0},"end":{"line":13,"column":0}}]},"2":{"line":15,"type":"if","locations":[{"start":{"line":15,"column":4},"end":{"line":15,"column":4}},{"start":{"line":15,"column":4},"end":{"line":15,"column":4}}]},"3":{"line":34,"type":"if","locations":[{"start":{"line":34,"column":0},"end":{"line":34,"column":0}},{"start":{"line":34,"column":0},"end":{"line":34,"column":0}}]}}};
}
__cov_Jik9dObhExao7pXak0WMrA = __cov_Jik9dObhExao7pXak0WMrA['/Users/thiago/git/tree-gateway/bin/lib/app.js'];
__cov_Jik9dObhExao7pXak0WMrA.s['1']++;
var express = require('express');
__cov_Jik9dObhExao7pXak0WMrA.s['2']++;
var logger = require('morgan');
__cov_Jik9dObhExao7pXak0WMrA.s['3']++;
var gateway_1 = require('./gateway');
__cov_Jik9dObhExao7pXak0WMrA.s['4']++;
var fs = require('fs-extra');
__cov_Jik9dObhExao7pXak0WMrA.s['5']++;
var winston = require('winston');
__cov_Jik9dObhExao7pXak0WMrA.s['6']++;
var typescript_ioc_1 = require('typescript-ioc');
__cov_Jik9dObhExao7pXak0WMrA.s['7']++;
var compression = require('compression');
__cov_Jik9dObhExao7pXak0WMrA.s['8']++;
var settings_1 = require('../lib/settings');
__cov_Jik9dObhExao7pXak0WMrA.s['9']++;
var path = require('path');
__cov_Jik9dObhExao7pXak0WMrA.s['10']++;
var StringUtils = require('underscore.string');
__cov_Jik9dObhExao7pXak0WMrA.s['11']++;
var rootDir = __dirname;
__cov_Jik9dObhExao7pXak0WMrA.s['12']++;
if (process.argv.length > 2) {
    __cov_Jik9dObhExao7pXak0WMrA.b['1'][0]++;
    __cov_Jik9dObhExao7pXak0WMrA.s['13']++;
    rootDir = process.argv[2];
    __cov_Jik9dObhExao7pXak0WMrA.s['14']++;
    if (StringUtils.startsWith(rootDir, '.')) {
        __cov_Jik9dObhExao7pXak0WMrA.b['2'][0]++;
        __cov_Jik9dObhExao7pXak0WMrA.s['15']++;
        rootDir = path.join(process.cwd(), rootDir);
    } else {
        __cov_Jik9dObhExao7pXak0WMrA.b['2'][1]++;
    }
    __cov_Jik9dObhExao7pXak0WMrA.s['16']++;
    var provider = {
        get: function () {
            __cov_Jik9dObhExao7pXak0WMrA.f['1']++;
            __cov_Jik9dObhExao7pXak0WMrA.s['17']++;
            var settings = new settings_1.Settings();
            __cov_Jik9dObhExao7pXak0WMrA.s['18']++;
            settings.app = express();
            __cov_Jik9dObhExao7pXak0WMrA.s['19']++;
            settings.apiPath = path.join(rootDir, 'apis');
            __cov_Jik9dObhExao7pXak0WMrA.s['20']++;
            settings.middlewarePath = path.join(rootDir, 'middleware');
            __cov_Jik9dObhExao7pXak0WMrA.s['21']++;
            return settings;
        }
    };
    __cov_Jik9dObhExao7pXak0WMrA.s['22']++;
    typescript_ioc_1.Container.bind(settings_1.Settings).provider(provider);
} else {
    __cov_Jik9dObhExao7pXak0WMrA.b['1'][1]++;
}
__cov_Jik9dObhExao7pXak0WMrA.s['23']++;
winston.add(winston.transports.File, { filename: path.join(rootDir, 'logs/gateway.log') });
__cov_Jik9dObhExao7pXak0WMrA.s['24']++;
var gateway = typescript_ioc_1.Container.get(gateway_1.Gateway);
__cov_Jik9dObhExao7pXak0WMrA.s['25']++;
var app = gateway.server;
__cov_Jik9dObhExao7pXak0WMrA.s['26']++;
app.disable('x-powered-by');
__cov_Jik9dObhExao7pXak0WMrA.s['27']++;
app.use(compression());
__cov_Jik9dObhExao7pXak0WMrA.s['28']++;
if (app.get('env') == 'production') {
    __cov_Jik9dObhExao7pXak0WMrA.b['3'][0]++;
    __cov_Jik9dObhExao7pXak0WMrA.s['29']++;
    var accessLogStream = fs.createWriteStream(path.join(rootDir, 'logs/access_errors.log'), { flags: 'a' });
    __cov_Jik9dObhExao7pXak0WMrA.s['30']++;
    app.use(logger('common', {
        skip: function (req, res) {
            __cov_Jik9dObhExao7pXak0WMrA.f['2']++;
            __cov_Jik9dObhExao7pXak0WMrA.s['31']++;
            return res.statusCode < 400;
        },
        stream: accessLogStream
    }));
} else {
    __cov_Jik9dObhExao7pXak0WMrA.b['3'][1]++;
    __cov_Jik9dObhExao7pXak0WMrA.s['32']++;
    app.use(logger('dev'));
}
__cov_Jik9dObhExao7pXak0WMrA.s['33']++;
gateway.initialize();
__cov_Jik9dObhExao7pXak0WMrA.s['34']++;
app.listen(3010);
__cov_Jik9dObhExao7pXak0WMrA.s['35']++;
module.exports = app;

//# sourceMappingURL=app.js.map
