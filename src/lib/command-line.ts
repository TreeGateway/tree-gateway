"use strict";

import * as path from "path";
import {ArgumentParser} from "argparse";
import {Configuration} from "./configuration";

let parser = new ArgumentParser({
  version: '0.0.1',
  addHelp: true,
  description: 'Tree-Gateway'
});

parser.addArgument(
  [ '-c', '--config' ],
  {
    help: 'The Tree-Gateway config file (tree-gateway.json).'
  }
);

let parameters = parser.parseArgs();

Configuration.gatewayConfigFile = parameters.config;

