'use strict';

import { ArgumentParser } from 'argparse';
import { Configuration } from './configuration';

const parser = new ArgumentParser({
    addHelp: true,
    description: 'Tree-Gateway',
    version: '0.0.4'
});

parser.addArgument(
    ['-c', '--config'],
    {
        help: 'The Tree-Gateway config file (tree-gateway.json).'
    }
);

const parameters = parser.parseArgs();

Configuration.gatewayConfigFile = parameters.config;
