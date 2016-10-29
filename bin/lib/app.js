"use strict";
var logger = require("morgan");
var gateway_1 = require("./gateway");
var fs = require("fs-extra");
var winston = require("winston");
var typescript_ioc_1 = require("typescript-ioc");
var compression = require("compression");
winston.add(winston.transports.File, { filename: __dirname + '/logs/gateway.log' });
var gateway = typescript_ioc_1.Container.get(gateway_1.Gateway);
var app = gateway.server;
app.use(compression());
if (app.get('env') == 'production') {
    var accessLogStream = fs.createWriteStream(__dirname + '/logs/access_errors.log', { flags: 'a' });
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
app.listen(3010);
module.exports = app;

//# sourceMappingURL=app.js.map
