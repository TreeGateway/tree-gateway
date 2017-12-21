'use strict';

import { ArgumentParser } from 'argparse';
import { Metrics } from './metrics';

const packageJson = require('../package.json');

const parser = new ArgumentParser({
    addHelp: true,
    description: 'Tree-Gateway',
    version: packageJson.version
});

parser.addArgument(
    ['-c', '--config'],
    {
        help: 'The Tree-Gateway config file (tree-gateway.yaml).'
    }
);

parser.addArgument(
    ['-i', '--instances'],
    {
        defaultValue: 1,
        help: 'The number of instances to start (0 = all cpus cores)',
        type: 'int'
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

parser.addArgument(
    ['-m', '--metrics'],
    {
        constant: true,
        defaultValue: false,
        help: 'Collect metrics about node js process. Enable it if you want to use any monitor',
        nargs: '?'
    }
);

const parameters = parser.parseArgs();
const collectMetrics = parameters.metrics;

if (collectMetrics) {
    Metrics.initialize();
}

import { Configuration } from './configuration';

Configuration.gatewayConfigFile = parameters.config;
Configuration.resetBeforeStart = parameters.reset;
Configuration.instances = parameters.instances;
