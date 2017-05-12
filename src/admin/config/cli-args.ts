'use strict';

import { ArgumentParser } from 'argparse';

const parser = new ArgumentParser({
    addHelp: true,
    description: 'Tree-Gateway Admin',
    version: '0.0.1'
});

parser.addArgument(['-s', '--swagger'], {
    help: 'Inform the URL pointing to the swagger file on the Tree Gateway target server',
    required: true
});

parser.addArgument(['-u', '--username'], {
    help: 'Inform the user to sign in into the gateway API',
    required: true
});

parser.addArgument(['-p', '--password'], {
    help: 'Inform the user password to sign in into the gateway API',
    required: true
});

const commands = parser.addSubparsers({
    dest: 'command',
    title: 'Commands (For help, <command> -h/--help)'
});

const apisCommand = commands.addParser('apis', {
    addHelp: true,
    help: 'APIs configurations'
});

apisCommand.addArgument(
    ['-l', '--list'], {
        help: 'Inform the search params for API listing. Ex: name:test|version:0.0.1'
    }
);

apisCommand.addArgument(
    ['-a', '--add'], {
        help: 'Inform the path to the api config file (JSON format) to be added',
    }
);

apisCommand.addArgument(
    ['-u', '--update'], {
        help: 'Inform the path to the api config file (JSON format) to be updated',
    }
);

apisCommand.addArgument(
    ['-r', '--remove'], {
        help: 'Inform the path to the api config file (JSON format) to be removed',
    }
);

apisCommand.addArgument(
    ['-g', '--get'], {
        help: 'Inform the path to the api config file (JSON format) to be retrieved',
    }
);

export let configArgs = parser.parseArgs();
