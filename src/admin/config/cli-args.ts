'use strict';

import { ArgumentParser } from 'argparse';

const parser = new ArgumentParser({
    addHelp: true,
    description: 'Tree-Gateway Admin',
    version: '0.0.5'
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
        help: 'Inform the search params for API listing. Ex: --list name:test version:0.0.1',
        nargs: '*'
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
        help: 'Inform the api id to be removed',
    }
);

apisCommand.addArgument(
    ['-g', '--get'], {
        help: 'Inform the api id to be retrieved',
    }
);

const gatewayCommand = commands.addParser('gateway', {
    addHelp: true,
    help: 'Gateway configurations'
});

gatewayCommand.addArgument(
    ['-u', '--update'], {
        help: 'Inform the path to the gateway config file (JSON format) to be updated',
    }
);

gatewayCommand.addArgument(
    ['-r', '--remove'], {
        constant: true,
        defaultValue: false,
        help: 'Remove the gateway configuration',
        nargs: '?'
    }
);

gatewayCommand.addArgument(
    ['-g', '--get'], {
        constant: true,
        defaultValue: false,
        help: 'Inform the path to the api config file (JSON format) to be retrieved',
        nargs: '?'
    }
);

const middlewareCommand = commands.addParser('middleware', {
    addHelp: true,
    help: 'Middleware configurations'
});

const middlewareCommands = middlewareCommand.addSubparsers({
    dest: 'middlewareCommand',
    title: 'Middleware Commands (For help, <command> -h/--help)'
});

const filterCommand = middlewareCommands.addParser('filter', {
    addHelp: true,
    help: 'Filter configurations'
});

filterCommand.addArgument(
    ['-l', '--list'], {
        help: 'Inform the search params for Filter listing. Ex: --list name:test',
        nargs: '*'
    }
);

filterCommand.addArgument(
    ['-r', '--remove'], {
        help: 'Inform the filter name to be removed',
    }
);

filterCommand.addArgument(
    ['-u', '--update'], {
        help: 'Inform the name and path to the filter file (JS format) to be updated. Ex: -u filter1 ./filters/filter1.js',
        nargs: 2
    }
);

filterCommand.addArgument(
    ['-a', '--add'], {
        help: 'Inform the name and path to the filter file (JS format) to be added. Ex: -a filter1 ./filters/filter1.js',
    }
);

filterCommand.addArgument(
    ['-g', '--get'], {
        help: 'Inform the name of the filter to be retrieved',
    }
);

const requestInterceptor = middlewareCommands.addParser('requestInterceptor', {
    addHelp: true,
    help: 'Request Interceptor configurations'
});

requestInterceptor.addArgument(
    ['-l', '--list'], {
        help: 'Inform the search params for Request Interceptor listing. Ex: --list name:test',
        nargs: '*'
    }
);

requestInterceptor.addArgument(
    ['-r', '--remove'], {
        help: 'Inform the Request Interceptor name to be removed',
    }
);

requestInterceptor.addArgument(
    ['-u', '--update'], {
        help: 'Inform the name and path to the Request Interceptor file (JS format) to be updated. Ex: -u interceptor1 ./interceptors/interceptor1.js',
        nargs: 2
    }
);

requestInterceptor.addArgument(
    ['-a', '--add'], {
        help: 'Inform the name and path to the Request Interceptor file (JS format) to be added. Ex: -a interceptor1 ./interceptors/interceptor1.js',
    }
);

requestInterceptor.addArgument(
    ['-g', '--get'], {
        help: 'Inform the name of the Request Interceptor to be retrieved',
    }
);

const responseInterceptor = middlewareCommands.addParser('responseInterceptor', {
    addHelp: true,
    help: 'Response Interceptor configurations'
});

responseInterceptor.addArgument(
    ['-l', '--list'], {
        help: 'Inform the search params for Response Interceptor listing. Ex: --list name:test',
        nargs: '*'
    }
);

responseInterceptor.addArgument(
    ['-r', '--remove'], {
        help: 'Inform the Response Interceptor name to be removed',
    }
);

responseInterceptor.addArgument(
    ['-u', '--update'], {
        help: 'Inform the name and path to the Response Interceptor file (JS format) to be updated. Ex: -u interceptor1 ./interceptors/interceptor1.js',
        nargs: 2
    }
);

responseInterceptor.addArgument(
    ['-a', '--add'], {
        help: 'Inform the name and path to the Response Interceptor file (JS format) to be added. Ex: -a interceptor1 ./interceptors/interceptor1.js',
    }
);

responseInterceptor.addArgument(
    ['-g', '--get'], {
        help: 'Inform the name of the Response Interceptor to be retrieved',
    }
);

const authStrategy = middlewareCommands.addParser('authStrategy', {
    addHelp: true,
    help: 'Auth Strategy configurations'
});

authStrategy.addArgument(
    ['-l', '--list'], {
        help: 'Inform the search params for Auth Strategy listing. Ex: --list name:test',
        nargs: '*'
    }
);

authStrategy.addArgument(
    ['-r', '--remove'], {
        help: 'Inform the Auth Strategy name to be removed',
    }
);

authStrategy.addArgument(
    ['-u', '--update'], {
        help: 'Inform the name and path to the Auth Strategy file (JS format) to be updated. Ex: -u strategy1 ./strategies/stragety1.js',
        nargs: 2
    }
);

authStrategy.addArgument(
    ['-a', '--add'], {
        help: 'Inform the name and path to the Auth Strategy file (JS format) to be added. Ex: -a strategy1 ./strategies/stragety1.js',
    }
);

authStrategy.addArgument(
    ['-g', '--get'], {
        help: 'Inform the name of the Auth Strategy to be retrieved',
    }
);
export let configArgs = parser.parseArgs();
