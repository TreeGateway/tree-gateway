"use strict";

import * as path from "path";
import {ArgumentParser} from "argparse";
import {Configuration} from "../../configuration";

let parser = new ArgumentParser({
  version: '0.0.1',
  addHelp: true,
  description: 'Tree-Gateway User Admin'
});

parser.addArgument(
  [ '-c', '--config' ],
  {
    help: 'The Tree-Gateway config file (tree-gateway.json).',
    defaultValue: path.join(process.cwd(), 'tree-gateway.json')
  }
);

let commands = parser.addSubparsers({
  title: 'Commands (For help, <command> -h/--help)',
  dest: 'command'
})

let addCommand = commands.addParser('add', { 
    addHelp: true, 
    help: 'Add a new user.' 
});

addCommand.addArgument(
  [ '-u', '--user' ],
  {
    help: 'Inform the user login',
    required: true
  }
);
addCommand.addArgument(
  [ '-p', '--pass' ],
  {
    help: 'Inform the user password',
    required: true
  }
);
addCommand.addArgument(
  [ '-n', '--name' ],
  {
    help: 'Inform the user name',
    required: true
  }
);
addCommand.addArgument(
  [ '-e', '--email' ],
  {
    help: 'Inform the user email'
  }
);

let removeCommand = commands.addParser('remove', { 
    addHelp: true, 
    help: 'Remove a user.' 
});

removeCommand.addArgument(
  [ '-u', '--user' ],
  {
    help: 'Inform the user login',
    required: true
  }
);

let listCommand = commands.addParser('list', { 
    addHelp: true, 
    help: 'List the existing users.' 
});

let passwordCommand = commands.addParser('password', { 
    addHelp: true, 
    help: 'Define a password for the given user.' 
});

passwordCommand.addArgument(
  [ '-u', '--user' ],
  {
    help: 'Inform the user login',
    required: true
  }
);

passwordCommand.addArgument(
  [ '-p', '--pass' ],
  {
    help: 'Inform the user password',
    required: true
  }
);

export let UserAdminArgs = parser.parseArgs();
Configuration.gatewayConfigFile = UserAdminArgs.config;
