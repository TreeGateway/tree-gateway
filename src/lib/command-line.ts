"use strict";

import * as path from "path";

let args = require("args");

let parameters = args
  .option('config', 'The Tree-Gateway config file (tree-gateway.json).', path.join(process.cwd(), 'tree-gateway.json'))
  .parse(process.argv);

export class Parameters {
    static gatewayConfigFile: string;
}

Parameters.gatewayConfigFile = parameters.config;

