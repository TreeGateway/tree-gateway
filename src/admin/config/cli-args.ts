'use strict';

import { ArgumentParser } from 'argparse';
import { Configuration } from '../../configuration';

const parser = new ArgumentParser({
    addHelp: true,
    description: 'Tree-Gateway Admin',
    version: '1.1.12'
});

parser.addArgument(
    ['-c', '--config'],
    {
        help: 'The Tree-Gateway config file (tree-gateway.json).'
    }
);

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
        help: 'Inform the path to the api config file (JSON or YAML format) to be added',
    }
);

apisCommand.addArgument(
    ['-u', '--update'], {
        help: 'Inform the path to the api config file (JSON or YAML format) to be updated',
    }
);

apisCommand.addArgument(
    ['-r', '--remove'], {
        help: 'Inform the api id to be removed',
    }
);

apisCommand.addArgument(
    ['-g', '--get'], {
        help: 'Inform the api id to be retrieved (YAML format, by default). Pass the return format optionally. Ex apis -g <id> json',
        nargs: '+'
    }
);

const gatewayCommand = commands.addParser('gateway', {
    addHelp: true,
    help: 'Gateway configurations'
});

gatewayCommand.addArgument(
    ['-u', '--update'], {
        help: 'Inform the path to the gateway config file (JSON or YAML format) to be updated',
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
        help: 'Retrieve the gateway config file (YAML format, by default). Pass the return format optionally. Ex gateway -g json',
        nargs: '?'
    }
);

const configCommand = commands.addParser('config', {
    addHelp: true,
    help: 'Package all Gateway configurations'
});

configCommand.addArgument(
    ['-u', '--update'], {
        help: 'Inform the path to the gateway package config file (JSON or YAML format) to be updated',
    }
);

configCommand.addArgument(
    ['-g', '--get'], {
        constant: true,
        defaultValue: false,
        help: 'Export all Gateway config file (YAML format, by default). Pass the return format optionally. Ex gateway -g json',
        nargs: '?'
    }
);

const usersCommand = commands.addParser('users', {
    addHelp: true,
    help: 'Users configurations'
});

const usersCommands = usersCommand.addSubparsers({
    dest: 'usersCommand',
    title: 'Users Commands (For help, users <command> -h/--help)'
});

const usersAddCommand = usersCommands.addParser('add', {
    addHelp: true,
    help: 'Add a new user.'
});

usersAddCommand.addArgument(
    ['-l', '--login'],
    {
        help: 'Inform the user login',
        required: true
    }
);
usersAddCommand.addArgument(
    ['-p', '--password'],
    {
        help: 'Inform the user password',
        required: true
    }
);
usersAddCommand.addArgument(
    ['-n', '--name'],
    {
        help: 'Inform the user name',
        required: true
    }
);
usersAddCommand.addArgument(
    ['-e', '--email'],
    {
        help: 'Inform the user email'
    }
);
usersAddCommand.addArgument(
    ['-r', '--roles'],
    {
        help: 'Assign roles to the user. Available roles are: config and admin. Ex: users add --roles admin config',
        nargs: '*'
    }
);

const usersUpdateCommand = usersCommands.addParser('update', {
    addHelp: true,
    help: 'Update a user.'
});
usersUpdateCommand.addArgument(
    ['-l', '--login'],
    {
        help: 'Inform the user login',
        required: true
    }
);
usersUpdateCommand.addArgument(
    ['-n', '--name'],
    {
        help: 'Inform the user name',
    }
);
usersUpdateCommand.addArgument(
    ['-e', '--email'],
    {
        help: 'Inform the user email'
    }
);
usersUpdateCommand.addArgument(
    ['-r', '--roles'],
    {
        help: 'Assign roles to the user. Available roles are: config and admin. Ex: users add --roles admin config',
        nargs: '*'
    }
);

const usersRemoveCommand = usersCommands.addParser('remove', {
    addHelp: true,
    help: 'Remove a user.'
});

usersRemoveCommand.addArgument(
    ['-l', '--login'],
    {
        help: 'Inform the user login',
        required: true
    }
);

const usersGetCommand = usersCommands.addParser('get', {
    addHelp: true,
    help: 'Retrieve a user.'
});

usersGetCommand.addArgument(
    ['-l', '--login'],
    {
        help: 'Inform the user login',
        required: true
    }
);

usersGetCommand.addArgument(
    ['-f', '--format'],
    {
        help: 'Specify the output format',
    }
);

const usersListCommand = usersCommands.addParser('list', {
    addHelp: true,
    help: 'List the existing users.'
});

usersListCommand.addArgument(
    ['-f', '--filter'], {
        help: 'Inform the search params for Users listing. Ex: --filter name:joe email:test@',
        nargs: '*'
    }
);

const usersPasswordCommand = usersCommands.addParser('password', {
    addHelp: true,
    help: 'Define a password for the given user.'
});

usersPasswordCommand.addArgument(
    ['-l', '--login'],
    {
        help: 'Inform the user login',
        required: true
    }
);

usersPasswordCommand.addArgument(
    ['-p', '--password'],
    {
        help: 'Inform the user password',
        required: true
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
        nargs: 2
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
        nargs: 2
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
        nargs: 2
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
        nargs: 2
    }
);

authStrategy.addArgument(
    ['-g', '--get'], {
        help: 'Inform the name of the Auth Strategy to be retrieved',
    }
);

const authVerify = middlewareCommands.addParser('authVerify', {
    addHelp: true,
    help: 'Auth Verify configurations'
});

authVerify.addArgument(
    ['-l', '--list'], {
        help: 'Inform the search params for Auth Verify listing. Ex: --list name:test',
        nargs: '*'
    }
);

authVerify.addArgument(
    ['-r', '--remove'], {
        help: 'Inform the Auth Verify name to be removed',
    }
);

authVerify.addArgument(
    ['-u', '--update'], {
        help: 'Inform the name and path to the Auth Verify file (JS format) to be updated. Ex: -u verify1 ./verifiers/verify1.js',
        nargs: 2
    }
);

authVerify.addArgument(
    ['-a', '--add'], {
        help: 'Inform the name and path to the Auth Verify file (JS format) to be added. Ex: -a verify1 ./verifiers/verify1.js',
        nargs: 2
    }
);

authVerify.addArgument(
    ['-g', '--get'], {
        help: 'Inform the name of the Auth Verify to be retrieved',
    }
);

const throttlingKeyGenerator = middlewareCommands.addParser('throttlingKeyGenerator', {
    addHelp: true,
    help: 'Throttling Key Generator configurations'
});

throttlingKeyGenerator.addArgument(
    ['-l', '--list'], {
        help: 'Inform the search params for Throttling Key Generator listing. Ex: --list name:test',
        nargs: '*'
    }
);

throttlingKeyGenerator.addArgument(
    ['-r', '--remove'], {
        help: 'Inform the Throttling Key Generator name to be removed',
    }
);

throttlingKeyGenerator.addArgument(
    ['-u', '--update'], {
        help: 'Inform the name and path to the Throttling Key Generator file (JS format) to be updated. Ex: -u keyGen1 ./throttling/keyGen1.js',
        nargs: 2
    }
);

throttlingKeyGenerator.addArgument(
    ['-a', '--add'], {
        help: 'Inform the name and path to the Throttling Key Generator file (JS format) to be added. Ex: -a keyGen1 ./throttling/keyGen1.js',
        nargs: 2
    }
);

throttlingKeyGenerator.addArgument(
    ['-g', '--get'], {
        help: 'Inform the name of the Throttling Key Generator to be retrieved',
    }
);

const throttlingHandler = middlewareCommands.addParser('throttlingHandler', {
    addHelp: true,
    help: 'Throttling Handler configurations'
});

throttlingHandler.addArgument(
    ['-l', '--list'], {
        help: 'Inform the search params for Throttling Handler listing. Ex: --list name:test',
        nargs: '*'
    }
);

throttlingHandler.addArgument(
    ['-r', '--remove'], {
        help: 'Inform the Throttling Handler name to be removed',
    }
);

throttlingHandler.addArgument(
    ['-u', '--update'], {
        help: 'Inform the name and path to the Throttling Handler file (JS format) to be updated. Ex: -u handler1 ./throttling/handler1.js',
        nargs: 2
    }
);

throttlingHandler.addArgument(
    ['-a', '--add'], {
        help: 'Inform the name and path to the Throttling Handler file (JS format) to be added. Ex: -a handler1 ./throttling/handler1.js',
        nargs: 2
    }
);

throttlingHandler.addArgument(
    ['-g', '--get'], {
        help: 'Inform the name of the Throttling Handler to be retrieved',
    }
);

const throttlingSkip = middlewareCommands.addParser('throttlingSkip', {
    addHelp: true,
    help: 'Throttling Skip configurations'
});

throttlingSkip.addArgument(
    ['-l', '--list'], {
        help: 'Inform the search params for Throttling Skip listing. Ex: --list name:test',
        nargs: '*'
    }
);

throttlingSkip.addArgument(
    ['-r', '--remove'], {
        help: 'Inform the Throttling Skip name to be removed',
    }
);

throttlingSkip.addArgument(
    ['-u', '--update'], {
        help: 'Inform the name and path to the Throttling Skip file (JS format) to be updated. Ex: -u skip1 ./throttling/skip1.js',
        nargs: 2
    }
);

throttlingSkip.addArgument(
    ['-a', '--add'], {
        help: 'Inform the name and path to the Throttling Skip file (JS format) to be added. Ex: -a skip1 ./throttling/skip1.js',
        nargs: 2
    }
);

throttlingSkip.addArgument(
    ['-g', '--get'], {
        help: 'Inform the name of the Throttling Skip to be retrieved',
    }
);

const circuitbreaker = middlewareCommands.addParser('circuitbreaker', {
    addHelp: true,
    help: 'Circuitbreaker configurations'
});

circuitbreaker.addArgument(
    ['-l', '--list'], {
        help: 'Inform the search params for Circuitbreaker listing. Ex: --list name:test',
        nargs: '*'
    }
);

circuitbreaker.addArgument(
    ['-r', '--remove'], {
        help: 'Inform the Circuitbreaker name to be removed',
    }
);

circuitbreaker.addArgument(
    ['-u', '--update'], {
        help: 'Inform the name and path to the Circuitbreaker file (JS format) to be updated. Ex: -u breaker1 ./circuitbreaker/breaker1.js',
        nargs: 2
    }
);

circuitbreaker.addArgument(
    ['-a', '--add'], {
        help: 'Inform the name and path to the Circuitbreaker file (JS format) to be added. Ex: -a breaker1 ./circuitbreaker/breaker1.js',
        nargs: 2
    }
);

circuitbreaker.addArgument(
    ['-g', '--get'], {
        help: 'Inform the name of the Circuitbreaker to be retrieved',
    }
);

const cors = middlewareCommands.addParser('cors', {
    addHelp: true,
    help: 'Cors configurations'
});

cors.addArgument(
    ['-l', '--list'], {
        help: 'Inform the search params for Cors listing. Ex: --list name:test',
        nargs: '*'
    }
);

cors.addArgument(
    ['-r', '--remove'], {
        help: 'Inform the Cors name to be removed',
    }
);

cors.addArgument(
    ['-u', '--update'], {
        help: 'Inform the name and path to the Cors file (JS format) to be updated. Ex: -u handler1 ./cors/handler1.js',
        nargs: 2
    }
);

cors.addArgument(
    ['-a', '--add'], {
        help: 'Inform the name and path to the Cors file (JS format) to be added. Ex: -a handler1 ./cors/handler1.js',
        nargs: 2
    }
);

cors.addArgument(
    ['-g', '--get'], {
        help: 'Inform the name of the Cors to be retrieved',
    }
);

const proxyRouter = middlewareCommands.addParser('proxyRouter', {
    addHelp: true,
    help: 'Proxy Router configurations'
});

proxyRouter.addArgument(
    ['-l', '--list'], {
        help: 'Inform the search params for Proxy Router listing. Ex: --list name:test',
        nargs: '*'
    }
);

proxyRouter.addArgument(
    ['-r', '--remove'], {
        help: 'Inform the Proxy Router name to be removed',
    }
);

proxyRouter.addArgument(
    ['-u', '--update'], {
        help: 'Inform the name and path to the Proxy Router file (JS format) to be updated. Ex: -u handler1 ./proxy/router/handler1.js',
        nargs: 2
    }
);

proxyRouter.addArgument(
    ['-a', '--add'], {
        help: 'Inform the name and path to the Proxy Router file (JS format) to be added. Ex: -a handler1 ./proxy/router/handler1.js',
        nargs: 2
    }
);

proxyRouter.addArgument(
    ['-g', '--get'], {
        help: 'Inform the name of the Proxy Router to be retrieved',
    }
);

const serviceDiscovery = middlewareCommands.addParser('serviceDiscovery', {
    addHelp: true,
    help: 'Service Discovery configurations'
});

serviceDiscovery.addArgument(
    ['-l', '--list'], {
        help: 'Inform the search params for Service Discovery listing. Ex: --list name:test',
        nargs: '*'
    }
);

serviceDiscovery.addArgument(
    ['-r', '--remove'], {
        help: 'Inform the Service Discovery name to be removed',
    }
);

serviceDiscovery.addArgument(
    ['-u', '--update'], {
        help: 'Inform the name and path to the Service Discovery file (JS format) to be updated. Ex: -u handler1 ./servicediscovery/handler1.js',
        nargs: 2
    }
);

serviceDiscovery.addArgument(
    ['-a', '--add'], {
        help: 'Inform the name and path to the Service Discovery file (JS format) to be added. Ex: -a handler1 ./servicediscovery/handler1.js',
        nargs: 2
    }
);

serviceDiscovery.addArgument(
    ['-g', '--get'], {
        help: 'Inform the name of the Service Discovery to be retrieved',
    }
);
const serviceDiscoveryProvider = middlewareCommands.addParser('serviceDiscoveryProvider', {
    addHelp: true,
    help: 'Service Discovery Providers configurations'
});

serviceDiscoveryProvider.addArgument(
    ['-l', '--list'], {
        help: 'Inform the search params for Service Discovery Provider listing. Ex: --list name:test',
        nargs: '*'
    }
);

serviceDiscoveryProvider.addArgument(
    ['-r', '--remove'], {
        help: 'Inform the Service Discovery Provider name to be removed',
    }
);

serviceDiscoveryProvider.addArgument(
    ['-u', '--update'], {
        help: 'Inform the name and path to the Service Discovery Provider file (JS format) to be updated. Ex: -u handler1 ./servicediscovery/provider/handler1.js',
        nargs: 2
    }
);

serviceDiscoveryProvider.addArgument(
    ['-a', '--add'], {
        help: 'Inform the name and path to the Service Discovery Provider file (JS format) to be added. Ex: -a handler1 ./servicediscovery/provider/handler1.js',
        nargs: 2
    }
);

serviceDiscoveryProvider.addArgument(
    ['-g', '--get'], {
        help: 'Inform the name of the Service Discovery Provider to be retrieved',
    }
);
export let configArgs = parser.parseArgs();
Configuration.gatewayConfigFile = configArgs.config;
