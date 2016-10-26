"use strict";
var logger = require("morgan");
var gateway_1 = require("./gateway");
var fs = require("fs-extra");
var winston = require("winston");
winston.add(winston.transports.File, { filename: __dirname + '/logs/gateway.log' });
var gateway = new gateway_1.Gateway();
var app = gateway.server;
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
gateway.configure(__dirname + '/apis');
app.listen(3010);
module.exports = app;

//# sourceMappingURL=app.js.map
