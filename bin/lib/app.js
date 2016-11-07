"use strict";
var gateway_1 = require("./gateway");
var command_line_1 = require("./command-line");
var gateway = new gateway_1.Gateway(command_line_1.Parameters.gatewayConfigFile);
gateway.start(function () {
    gateway.startAdmin();
});

//# sourceMappingURL=app.js.map
