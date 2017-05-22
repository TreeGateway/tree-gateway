'use strict';

import * as path from 'path';
import { ArgumentParser } from 'argparse';
import { Configuration } from '../../configuration';

const parser = new ArgumentParser({
    addHelp: true,
    description: 'Tree-Gateway User Admin',
    version: '0.0.6'
});

parser.addArgument(
    ['-c', '--config'],
    {
        defaultValue: path.join(process.cwd(), 'tree-gateway.json'),
        help: 'The Tree-Gateway config file (tree-gateway.json).'
    }
);

const commands = parser.addSubparsers({
    dest: 'command',
    title: 'Commands (For help, <command> -h/--help)'
});

const addCommand = commands.addParser('add', {
    addHelp: true,
    help: 'Add a new user.'
});

addCommand.addArgument(
    ['-u', '--user'],
    {
        help: 'Inform the user login',
        required: true
    }
);
addCommand.addArgument(
    ['-p', '--pass'],
    {
        help: 'Inform the user password',
        required: true
    }
);
addCommand.addArgument(
    ['-n', '--name'],
    {
        help: 'Inform the user name',
        required: true
    }
);
addCommand.addArgument(
    ['-e', '--email'],
    {
        help: 'Inform the user email'
    }
);

const removeCommand = commands.addParser('remove', {
    addHelp: true,
    help: 'Remove a user.'
});

removeCommand.addArgument(
    ['-u', '--user'],
    {
        help: 'Inform the user login',
        required: true
    }
);

commands.addParser('list', {
    addHelp: true,
    help: 'List the existing users.'
});

const passwordCommand = commands.addParser('password', {
    addHelp: true,
    help: 'Define a password for the given user.'
});

passwordCommand.addArgument(
    ['-u', '--user'],
    {
        help: 'Inform the user login',
        required: true
    }
);

passwordCommand.addArgument(
    ['-p', '--pass'],
    {
        help: 'Inform the user password',
        required: true
    }
);

export let userAdminArgs = parser.parseArgs();
Configuration.gatewayConfigFile = userAdminArgs.config;
