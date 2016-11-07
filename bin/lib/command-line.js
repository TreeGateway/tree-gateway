"use strict";
var path = require("path");
var StringUtils = require("underscore.string");
var args = require("args");
var parameters = args
    .option('dir', 'The root directory where apis and middlewares are placed.', __dirname)
    .option('port', 'The gateway listen port.', 8000)
    .option('adminPort', 'The gateway admin server listen port.', 8001)
    .parse(process.argv);
var Parameters = (function () {
    function Parameters() {
    }
    return Parameters;
}());
exports.Parameters = Parameters;
Parameters.rootDir = parameters.dir;
Parameters.port = parameters.port;
Parameters.adminPort = parameters.adminPort;
if (StringUtils.startsWith(Parameters.rootDir, '.')) {
    Parameters.rootDir = path.join(process.cwd(), Parameters.rootDir);
}

//# sourceMappingURL=command-line.js.map
