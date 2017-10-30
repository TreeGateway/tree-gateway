'use strict';

import { ArgumentParser } from 'argparse';
import { Configuration } from './configuration';
const packageJson = require('../package.json');

const parser = new ArgumentParser({
    addHelp: true,
    description: 'Tree-Gateway',
    version: packageJson.version
});

parser.addArgument(
    ['-c', '--config'],
    {
        help: 'The Tree-Gateway config file (tree-gateway.json).'
    }
);

parser.addArgument(
    ['-i', '--instances'],
    {
        defaultValue: 1,
        type: 'int',
        help: 'The number of instances to start (0 = all cpus cores)'
    }
);

parser.addArgument(
    ['-r', '--reset'],
    {
        constant: true,
        defaultValue: false,
        help: 'Before start the gateway, reset all configurations.',
        nargs: '?'
    }
);

const parameters = parser.parseArgs();

Configuration.gatewayConfigFile = parameters.config;
Configuration.resetBeforeStart = parameters.reset;
Configuration.instances = parameters.instances;
