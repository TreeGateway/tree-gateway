"use strict";
var path = require("path");
var args = require("args");
var parameters = args
    .option('config', 'The Tree-Gateway config file (tree-gateway.json).', path.join(process.cwd(), 'tree-gateway.json'))
    .parse(process.argv);
var Parameters = (function () {
    function Parameters() {
    }
    return Parameters;
}());
exports.Parameters = Parameters;
Parameters.gatewayConfigFile = parameters.config;

//# sourceMappingURL=command-line.js.map
