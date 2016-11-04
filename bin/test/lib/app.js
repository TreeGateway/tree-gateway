"use strict";
var __cov_Jik9dObhExao7pXak0WMrA = (Function('return this'))();
if (!__cov_Jik9dObhExao7pXak0WMrA.$$cov_1478225508621$$) { __cov_Jik9dObhExao7pXak0WMrA.$$cov_1478225508621$$ = {}; }
__cov_Jik9dObhExao7pXak0WMrA = __cov_Jik9dObhExao7pXak0WMrA.$$cov_1478225508621$$;
if (!(__cov_Jik9dObhExao7pXak0WMrA['/Users/thiago/git/tree-gateway/bin/lib/app.js'])) {
   __cov_Jik9dObhExao7pXak0WMrA['/Users/thiago/git/tree-gateway/bin/lib/app.js'] = {"path":"/Users/thiago/git/tree-gateway/bin/lib/app.js","s":{"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0,"8":0,"9":0,"10":0,"11":0,"12":0,"13":0,"14":0,"15":0,"16":1,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0,"24":0,"25":0,"26":0,"27":0,"28":0,"29":1,"30":0,"31":0,"32":0,"33":0,"34":0,"35":0,"36":0,"37":0},"b":{"1":[0,0]},"f":{"1":0,"2":0,"3":0,"4":0,"5":0},"fnMap":{"1":{"name":"configureGatewayServer","line":17,"loc":{"start":{"line":17,"column":0},"end":{"line":17,"column":34}}},"2":{"name":"(anonymous_2)","line":24,"loc":{"start":{"line":24,"column":18},"end":{"line":24,"column":38}}},"3":{"name":"(anonymous_3)","line":33,"loc":{"start":{"line":33,"column":47},"end":{"line":33,"column":59}}},"4":{"name":"configureAdminServer","line":38,"loc":{"start":{"line":38,"column":0},"end":{"line":38,"column":32}}},"5":{"name":"(anonymous_5)","line":44,"loc":{"start":{"line":44,"column":60},"end":{"line":44,"column":72}}}},"statementMap":{"1":{"start":{"line":2,"column":0},"end":{"line":2,"column":33}},"2":{"start":{"line":3,"column":0},"end":{"line":3,"column":31}},"3":{"start":{"line":4,"column":0},"end":{"line":4,"column":37}},"4":{"start":{"line":5,"column":0},"end":{"line":5,"column":29}},"5":{"start":{"line":6,"column":0},"end":{"line":6,"column":33}},"6":{"start":{"line":7,"column":0},"end":{"line":7,"column":49}},"7":{"start":{"line":8,"column":0},"end":{"line":8,"column":41}},"8":{"start":{"line":9,"column":0},"end":{"line":9,"column":47}},"9":{"start":{"line":10,"column":0},"end":{"line":10,"column":53}},"10":{"start":{"line":11,"column":0},"end":{"line":11,"column":27}},"11":{"start":{"line":12,"column":0},"end":{"line":12,"column":51}},"12":{"start":{"line":13,"column":0},"end":{"line":13,"column":64}},"13":{"start":{"line":14,"column":0},"end":{"line":14,"column":35}},"14":{"start":{"line":15,"column":0},"end":{"line":15,"column":21}},"15":{"start":{"line":16,"column":0},"end":{"line":16,"column":23}},"16":{"start":{"line":17,"column":0},"end":{"line":37,"column":1}},"17":{"start":{"line":18,"column":4},"end":{"line":18,"column":29}},"18":{"start":{"line":19,"column":4},"end":{"line":19,"column":32}},"19":{"start":{"line":20,"column":4},"end":{"line":20,"column":27}},"20":{"start":{"line":21,"column":4},"end":{"line":31,"column":5}},"21":{"start":{"line":22,"column":8},"end":{"line":22,"column":139}},"22":{"start":{"line":23,"column":8},"end":{"line":27,"column":40}},"23":{"start":{"line":25,"column":16},"end":{"line":25,"column":44}},"24":{"start":{"line":30,"column":8},"end":{"line":30,"column":31}},"25":{"start":{"line":32,"column":4},"end":{"line":32,"column":25}},"26":{"start":{"line":33,"column":4},"end":{"line":35,"column":7}},"27":{"start":{"line":34,"column":8},"end":{"line":34,"column":86}},"28":{"start":{"line":36,"column":4},"end":{"line":36,"column":15}},"29":{"start":{"line":38,"column":0},"end":{"line":48,"column":1}},"30":{"start":{"line":39,"column":4},"end":{"line":39,"column":32}},"31":{"start":{"line":40,"column":4},"end":{"line":40,"column":40}},"32":{"start":{"line":41,"column":4},"end":{"line":41,"column":35}},"33":{"start":{"line":42,"column":4},"end":{"line":42,"column":35}},"34":{"start":{"line":43,"column":4},"end":{"line":43,"column":83}},"35":{"start":{"line":44,"column":4},"end":{"line":46,"column":7}},"36":{"start":{"line":45,"column":8},"end":{"line":45,"column":101}},"37":{"start":{"line":47,"column":4},"end":{"line":47,"column":23}}},"branchMap":{"1":{"line":21,"type":"if","locations":[{"start":{"line":21,"column":4},"end":{"line":21,"column":4}},{"start":{"line":21,"column":4},"end":{"line":21,"column":4}}]}}};
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
var command_line_1 = require('./command-line');
__cov_Jik9dObhExao7pXak0WMrA.s['9']++;
var admin_server_1 = require('./admin/admin-server');
__cov_Jik9dObhExao7pXak0WMrA.s['10']++;
var path = require('path');
__cov_Jik9dObhExao7pXak0WMrA.s['11']++;
var typescript_rest_1 = require('typescript-rest');
__cov_Jik9dObhExao7pXak0WMrA.s['12']++;
var gateway = typescript_ioc_1.Container.get(gateway_1.Gateway);
__cov_Jik9dObhExao7pXak0WMrA.s['13']++;
var app = configureGatewayServer();
__cov_Jik9dObhExao7pXak0WMrA.s['14']++;
module.exports = app;
__cov_Jik9dObhExao7pXak0WMrA.s['15']++;
configureAdminServer();
function configureGatewayServer() {
    __cov_Jik9dObhExao7pXak0WMrA.f['1']++;
    __cov_Jik9dObhExao7pXak0WMrA.s['17']++;
    var app = gateway.server;
    __cov_Jik9dObhExao7pXak0WMrA.s['18']++;
    app.disable('x-powered-by');
    __cov_Jik9dObhExao7pXak0WMrA.s['19']++;
    app.use(compression());
    __cov_Jik9dObhExao7pXak0WMrA.s['20']++;
    if (app.get('env') == 'production') {
        __cov_Jik9dObhExao7pXak0WMrA.b['1'][0]++;
        __cov_Jik9dObhExao7pXak0WMrA.s['21']++;
        var accessLogStream = fs.createWriteStream(path.join(command_line_1.Parameters.rootDir, 'logs/access_errors.log'), { flags: 'a' });
        __cov_Jik9dObhExao7pXak0WMrA.s['22']++;
        app.use(logger('common', {
            skip: function (req, res) {
                __cov_Jik9dObhExao7pXak0WMrA.f['2']++;
                __cov_Jik9dObhExao7pXak0WMrA.s['23']++;
                return res.statusCode < 400;
            },
            stream: accessLogStream
        }));
    } else {
        __cov_Jik9dObhExao7pXak0WMrA.b['1'][1]++;
        __cov_Jik9dObhExao7pXak0WMrA.s['24']++;
        app.use(logger('dev'));
    }
    __cov_Jik9dObhExao7pXak0WMrA.s['25']++;
    gateway.initialize();
    __cov_Jik9dObhExao7pXak0WMrA.s['26']++;
    app.listen(command_line_1.Parameters.port, function () {
        __cov_Jik9dObhExao7pXak0WMrA.f['3']++;
        __cov_Jik9dObhExao7pXak0WMrA.s['27']++;
        winston.info('Gateway listenning on port %d', command_line_1.Parameters.port);
    });
    __cov_Jik9dObhExao7pXak0WMrA.s['28']++;
    return app;
}
function configureAdminServer() {
    __cov_Jik9dObhExao7pXak0WMrA.f['4']++;
    __cov_Jik9dObhExao7pXak0WMrA.s['30']++;
    var adminServer = express();
    __cov_Jik9dObhExao7pXak0WMrA.s['31']++;
    adminServer.disable('x-powered-by');
    __cov_Jik9dObhExao7pXak0WMrA.s['32']++;
    adminServer.use(compression());
    __cov_Jik9dObhExao7pXak0WMrA.s['33']++;
    adminServer.use(logger('dev'));
    __cov_Jik9dObhExao7pXak0WMrA.s['34']++;
    typescript_rest_1.Server.buildServices(adminServer, admin_server_1.APIService);
    __cov_Jik9dObhExao7pXak0WMrA.s['35']++;
    adminServer.listen(command_line_1.Parameters.adminPort, function () {
        __cov_Jik9dObhExao7pXak0WMrA.f['5']++;
        __cov_Jik9dObhExao7pXak0WMrA.s['36']++;
        winston.info('Gateway Admin API listenning on port %d', command_line_1.Parameters.adminPort);
    });
    __cov_Jik9dObhExao7pXak0WMrA.s['37']++;
    return adminServer;
}

//# sourceMappingURL=app.js.map
