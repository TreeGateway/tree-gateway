"use strict";
var logger = require("morgan");
var gateway_1 = require("./gateway");
var fs = require("fs-extra");
var winston = require("winston");
var typescript_ioc_1 = require("typescript-ioc");
var compression = require("compression");
var command_line_1 = require("./command-line");
var path = require("path");
var gateway = typescript_ioc_1.Container.get(gateway_1.Gateway);
var app = gateway.server;
app.disable('x-powered-by');
app.use(compression());
if (app.get('env') == 'production') {
    var accessLogStream = fs.createWriteStream(path.join(command_line_1.Parameters.rootDir, 'logs/access_errors.log'), { flags: 'a' });
    app.use(logger('common', {
        skip: function (req, res) {
            return res.statusCode < 400;
        },
        stream: accessLogStream }));
}
else {
    app.use(logger('dev'));
}
gateway.initialize();
app.listen(command_line_1.Parameters.port, function () {
    winston.info('Gateway listenning port %d', command_line_1.Parameters.port);
});
module.exports = app;

//# sourceMappingURL=app.js.map
