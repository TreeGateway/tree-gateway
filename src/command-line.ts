'use strict';

import { ArgumentParser } from 'argparse';
import { Configuration } from './configuration';

const parser = new ArgumentParser({
    addHelp: true,
    description: 'Tree-Gateway',
    version: '1.0.0'
});

parser.addArgument(
    ['-c', '--config'],
    {
        help: 'The Tree-Gateway config file (tree-gateway.json).'
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
