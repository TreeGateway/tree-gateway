"use strict";

import * as path from "path";
import {ArgumentParser} from "argparse";

let parser = new ArgumentParser({
  version: '0.0.1',
  addHelp: true,
  description: 'Tree-Gateway'
});

parser.addArgument(
  [ '-c', '--config' ],
  {
    help: 'The Tree-Gateway config file (tree-gateway.json).',
    defaultValue: path.join(process.cwd(), 'tree-gateway.json')
  }
);

let parameters = parser.parseArgs();

export class Parameters {
    static gatewayConfigFile: string;
}

Parameters.gatewayConfigFile = parameters.config;

