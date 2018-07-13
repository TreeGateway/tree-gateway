'use strict';

import * as fs from 'fs-extra-promise';
import { Inject } from 'typescript-ioc';
import * as YAML from 'yamljs';
import { ApiConfig } from '../../config/api';
import { ConfigPackage } from '../../config/config-package';
import { GatewayConfig } from '../../config/gateway';
import { UserData } from '../../config/users';
import { Configuration } from '../../configuration';
import { generateSecurityToken, getSwaggerHost, getSwaggerUrl } from '../../utils/config';
import { SDK } from './sdk';

// tslint:disable:no-console

export class Cli {
    @Inject private config: Configuration;

    private args: any;
    private sdk: SDK;

    constructor(configArgs: any) {
        this.args = configArgs;
    }

    public async processCommand(): Promise<void> {
        this.sdk = await SDK.initialize({
            defaultHost: getSwaggerHost(this.config.gateway),
            swaggerUrl: getSwaggerUrl(this.config.gateway),
            token: generateSecurityToken(this.config.gateway)
        });
        return this.doCommand();
    }

    private async doCommand(): Promise<void> {
        switch (this.args.command) {
            case 'apis':
                return this.processApis();
            case 'gateway':
                return this.processGateway();
            case 'config':
                return this.processConfig();
            case 'users':
                return this.processUsers();
            case 'middleware':
                return this.processMiddleware();
            default:
                throw new Error(`Command not found: ${this.args.command}`);
        }
    }

    private async processUsers(): Promise<void> {
        switch (this.args.usersCommand) {
            case 'add':
                return this.processUsersAdd();
            case 'remove':
                return this.processUsersRemove();
            case 'list':
                return this.processUsersList();
            case 'password':
                return this.processUsersPassword();
            case 'get':
                return this.processUsersGet();
            case 'update':
                return this.processUsersUpdate();
            default:
                throw new Error(`Command not found: ${this.args.usersCommand}`);
        }
    }

    private async processUsersAdd(): Promise<void> {
        const user: UserData = {
            login: this.args.login,
            name: this.args.name,
            password: this.args.password,
            roles: []
        };
        if (this.args.email) {
            user.email = this.args.email;
        }
        if (this.args.roles) {
            this.args.roles.forEach((role: string) => {
                if (role === 'config' || role === 'admin') {
                    user.roles.push(role);
                } else {
                    console.info(`Invalid role ${role}. Ignoring it...`);
                }
            });
        }
        await this.sdk.users.addUser(user);
        console.info('User created.');
    }

    private async processUsersUpdate(): Promise<void> {
        const user: any = {
            login: this.args.login,
        };
        if (this.args.name) {
            user.name = this.args.name;
        }
        if (this.args.email) {
            user.email = this.args.email;
        }
        if (this.args.roles) {
            user.roles = [];
            this.args.roles.forEach((role: string) => {
                if (role === 'config' || role === 'admin') {
                    user.roles.push(role);
                } else {
                    console.info(`Invalid role ${role}. Ignoring it...`);
                }
            });
        }
        await this.sdk.users.updateUser(user.login, user);
        console.info(`User updated`);
    }

    private async processUsersRemove(): Promise<void> {
        await this.sdk.users.removeUser(this.args.login);
        console.info('User removed.');
    }

    private async processUsersGet(): Promise<void> {
        const user = await this.sdk.users.getUser(this.args.login);
        if (this.args.format === 'json') {
            console.info(JSON.stringify(user, null, 4));
        } else {
            console.info(YAML.stringify(user, 15));
        }
    }

    private async processUsersList(): Promise<void> {
        this.args.filter = this.args.filter || [];

        const args: any = {};
        this.args.filter.forEach((param: string) => {
            const parts = param.split(':');
            if (parts.length === 2) {
                args[parts[0]] = parts[1];
            }
        });
        const users = await this.sdk.users.list(args);
        console.info(YAML.stringify(users));
    }

    private async processUsersPassword(): Promise<void> {
        await this.sdk.users.changeUserPassword(this.args.login, this.args.password);
        console.info('Password changed.');
    }

    private async processMiddleware(): Promise<void> {
        switch (this.args.middlewareCommand) {
            case 'filter':
                return this.processMiddlewareFilter();
            case 'requestInterceptor':
                return this.processMiddlewareRequestInterceptor();
            case 'responseInterceptor':
                return this.processMiddlewareResponseInterceptor();
            case 'authStrategy':
                return this.processMiddlewareAuthStrategy();
            case 'authVerify':
                return this.processMiddlewareAuthVerify();
            case 'throttlingKeyGenerator':
                return this.processMiddlewareThrottlingKeyGenerator();
            case 'throttlingHandler':
                return this.processMiddlewareThrottlingHandler();
            case 'throttlingSkip':
                return this.processMiddlewareThrottlingSkip();
            case 'circuitbreaker':
                return this.processMiddlewareCircuitBreaker();
            case 'cors':
                return this.processMiddlewareCors();
            case 'proxyRouter':
                return this.processMiddlewareProxyRouter();
            case 'serviceDiscovery':
                return this.processMiddlewareServiceDiscovery();
            case 'serviceDiscoveryProvider':
                return this.processMiddlewareServiceDiscoveryProvider();
            case 'errorHandler':
                return this.processMiddlewareErrorHandler();
            case 'requestLogger':
                return this.processMiddlewareRequestLogger();
            default:
                throw new Error(`Command not found: ${this.args.command}`);
        }
    }

    private async processMiddlewareFilter(): Promise<void> {
        if (this.args.list) {
            const args: any = {};
            this.args.list.forEach((param: string) => {
                const parts = param.split(':');
                if (parts.length === 2) {
                    args[parts[0]] = parts[1];
                }
            });
            const filters = await this.sdk.middleware.filters(args['name'] as string);
            console.info(YAML.stringify(filters));
        } else if (this.args.remove) {
            await this.sdk.middleware.removeFilter(this.args.remove);
            console.info(`Filter removed`);
        } else if (this.args.update) {
            const name = this.args.update[0];
            const fileName = this.args.update[1];
            await this.sdk.middleware.updateFilter(name, fileName);
            console.info(`Filter updated`);
        } else if (this.args.add) {
            const name = this.args.add[0];
            const fileName = this.args.add[1];
            await this.sdk.middleware.addFilter(name, fileName);
            console.info(`Filter added`);
        } else if (this.args.get) {
            const file = await this.sdk.middleware.getFilter(this.args.get);
            console.info(file.toString());
        } else {
            throw new Error('Invalid arguments. Type -h for more info.');
        }
    }

    private async processMiddlewareRequestInterceptor(): Promise<void> {
        if (this.args.list) {
            const args: any = {};
            this.args.list.forEach((param: string) => {
                const parts = param.split(':');
                if (parts.length === 2) {
                    args[parts[0]] = parts[1];
                }
            });
            const filters = await this.sdk.middleware.requestInterceptors(args['name'] as string);
            console.info(YAML.stringify(filters));
        } else if (this.args.remove) {
            await this.sdk.middleware.removeRequestInterceptor(this.args.remove);
            console.info(`Interceptor removed`);
        } else if (this.args.update) {
            const name = this.args.update[0];
            const fileName = this.args.update[1];
            await this.sdk.middleware.updateRequestInterceptor(name, fileName);
            console.info(`Interceptor updated`);
        } else if (this.args.add) {
            const name = this.args.add[0];
            const fileName = this.args.add[1];
            await this.sdk.middleware.addRequestInterceptor(name, fileName);
            console.info(`Interceptor added`);
        } else if (this.args.get) {
            const file = await this.sdk.middleware.getRequestInterceptor(this.args.get);
            console.info(file.toString());
        } else {
            throw new Error('Invalid arguments. Type -h for more info.');
        }
    }

    private async processMiddlewareResponseInterceptor(): Promise<void> {
        if (this.args.list) {
            const args: any = {};
            this.args.list.forEach((param: string) => {
                const parts = param.split(':');
                if (parts.length === 2) {
                    args[parts[0]] = parts[1];
                }
            });
            const filters = await this.sdk.middleware.responseInterceptors(args['name'] as string);
            console.info(YAML.stringify(filters));
        } else if (this.args.remove) {
            await this.sdk.middleware.removeResponseInterceptor(this.args.remove);
            console.info(`Interceptor removed`);
        } else if (this.args.update) {
            const name = this.args.update[0];
            const fileName = this.args.update[1];
            await this.sdk.middleware.updateResponseInterceptor(name, fileName);
            console.info(`Interceptor updated`);
        } else if (this.args.add) {
            const name = this.args.add[0];
            const fileName = this.args.add[1];
            await this.sdk.middleware.addResponseInterceptor(name, fileName);
            console.info(`Interceptor added`);
        } else if (this.args.get) {
            const file = await this.sdk.middleware.getResponseInterceptor(this.args.get);
            console.info(file.toString());
        } else {
            throw new Error('Invalid arguments. Type -h for more info.');
        }
    }

    private async processMiddlewareAuthStrategy(): Promise<void> {
        if (this.args.list) {
            const args: any = {};
            this.args.list.forEach((param: string) => {
                const parts = param.split(':');
                if (parts.length === 2) {
                    args[parts[0]] = parts[1];
                }
            });
            const filters = await this.sdk.middleware.authStrategies(args['name'] as string);
            console.info(YAML.stringify(filters));
        } else if (this.args.remove) {
            await this.sdk.middleware.removeAuthStrategy(this.args.remove);
            console.info(`Interceptor removed`);
        } else if (this.args.update) {
            const name = this.args.update[0];
            const fileName = this.args.update[1];
            await this.sdk.middleware.updateAuthStrategy(name, fileName);
            console.info(`Interceptor updated`);
        } else if (this.args.add) {
            const name = this.args.add[0];
            const fileName = this.args.add[1];
            await this.sdk.middleware.addAuthStrategy(name, fileName);
            console.info(`Interceptor added`);
        } else if (this.args.get) {
            const file = await this.sdk.middleware.getAuthStrategy(this.args.get);
            console.info(file.toString());
        } else {
            throw new Error('Invalid arguments. Type -h for more info.');
        }
    }

    private async processMiddlewareAuthVerify(): Promise<void> {
        if (this.args.list) {
            const args: any = {};
            this.args.list.forEach((param: string) => {
                const parts = param.split(':');
                if (parts.length === 2) {
                    args[parts[0]] = parts[1];
                }
            });
            const filters = await this.sdk.middleware.authVerify(args['name'] as string);
            console.info(YAML.stringify(filters));
        } else if (this.args.remove) {
            await this.sdk.middleware.removeAuthVerify(this.args.remove);
            console.info(`Middleware removed`);
        } else if (this.args.update) {
            const name = this.args.update[0];
            const fileName = this.args.update[1];
            await this.sdk.middleware.updateAuthVerify(name, fileName);
            console.info(`Middleware updated`);
        } else if (this.args.add) {
            const name = this.args.add[0];
            const fileName = this.args.add[1];
            await this.sdk.middleware.addAuthVerify(name, fileName);
            console.info(`Middleware added`);
        } else if (this.args.get) {
            const file = await this.sdk.middleware.getAuthVerify(this.args.get);
            console.info(file.toString());
        } else {
            throw new Error('Invalid arguments. Type -h for more info.');
        }
    }

    private async processMiddlewareThrottlingKeyGenerator(): Promise<void> {
        if (this.args.list) {
            const args: any = {};
            this.args.list.forEach((param: string) => {
                const parts = param.split(':');
                if (parts.length === 2) {
                    args[parts[0]] = parts[1];
                }
            });
            const filters = await this.sdk.middleware.throttlingKeyGenerator(args['name'] as string);
            console.info(YAML.stringify(filters));
        } else if (this.args.remove) {
            await this.sdk.middleware.removeThrottlingKeyGenerator(this.args.remove);
            console.info(`Middleware removed`);
        } else if (this.args.update) {
            const name = this.args.update[0];
            const fileName = this.args.update[1];
            await this.sdk.middleware.updateThrottlingKeyGenerator(name, fileName);
            console.info(`Middleware updated`);
        } else if (this.args.add) {
            const name = this.args.add[0];
            const fileName = this.args.add[1];
            await this.sdk.middleware.addThrottlingKeyGenerator(name, fileName);
            console.info(`Middleware added`);
        } else if (this.args.get) {
            const file = await this.sdk.middleware.getThrottlingKeyGenerator(this.args.get);
            console.info(file.toString());
        } else {
            throw new Error('Invalid arguments. Type -h for more info.');
        }
    }

    private async processMiddlewareThrottlingHandler(): Promise<void> {
        if (this.args.list) {
            const args: any = {};
            this.args.list.forEach((param: string) => {
                const parts = param.split(':');
                if (parts.length === 2) {
                    args[parts[0]] = parts[1];
                }
            });
            const filters = await this.sdk.middleware.throttlingHandler(args['name'] as string);
            console.info(YAML.stringify(filters));
        } else if (this.args.remove) {
            await this.sdk.middleware.removeThrottlingHandler(this.args.remove);
            console.info(`Middleware removed`);
        } else if (this.args.update) {
            const name = this.args.update[0];
            const fileName = this.args.update[1];
            await this.sdk.middleware.updateThrottlingHandler(name, fileName);
            console.info(`Middleware updated`);
        } else if (this.args.add) {
            const name = this.args.add[0];
            const fileName = this.args.add[1];
            await this.sdk.middleware.addThrottlingHandler(name, fileName);
            console.info(`Middleware added`);
        } else if (this.args.get) {
            const file = await this.sdk.middleware.getThrottlingHandler(this.args.get);
            console.info(file.toString());
        } else {
            throw new Error('Invalid arguments. Type -h for more info.');
        }
    }

    private async processMiddlewareThrottlingSkip(): Promise<void> {
        if (this.args.list) {
            const args: any = {};
            this.args.list.forEach((param: string) => {
                const parts = param.split(':');
                if (parts.length === 2) {
                    args[parts[0]] = parts[1];
                }
            });
            const filters = await this.sdk.middleware.throttlingSkip(args['name'] as string);
            console.info(YAML.stringify(filters));
        } else if (this.args.remove) {
            await this.sdk.middleware.removeThrottlingSkip(this.args.remove);
            console.info(`Middleware removed`);
        } else if (this.args.update) {
            const name = this.args.update[0];
            const fileName = this.args.update[1];
            await this.sdk.middleware.updateThrottlingSkip(name, fileName);
            console.info(`Middleware updated`);
        } else if (this.args.add) {
            const name = this.args.add[0];
            const fileName = this.args.add[1];
            await this.sdk.middleware.addThrottlingSkip(name, fileName);
            console.info(`Middleware added`);
        } else if (this.args.get) {
            const file = await this.sdk.middleware.getThrottlingSkip(this.args.get);
            console.info(file.toString());
        } else {
            throw new Error('Invalid arguments. Type -h for more info.');
        }
    }

    private async processMiddlewareCircuitBreaker(): Promise<void> {
        if (this.args.list) {
            const args: any = {};
            this.args.list.forEach((param: string) => {
                const parts = param.split(':');
                if (parts.length === 2) {
                    args[parts[0]] = parts[1];
                }
            });
            const filters = await this.sdk.middleware.circuitBreaker(args['name'] as string);
            console.info(YAML.stringify(filters));
        } else if (this.args.remove) {
            await this.sdk.middleware.removeCircuitBreaker(this.args.remove);
            console.info(`Middleware removed`);
        } else if (this.args.update) {
            const name = this.args.update[0];
            const fileName = this.args.update[1];
            await this.sdk.middleware.updateCircuitBreaker(name, fileName);
            console.info(`Middleware updated`);
        } else if (this.args.add) {
            const name = this.args.add[0];
            const fileName = this.args.add[1];
            await this.sdk.middleware.addCircuitBreaker(name, fileName);
            console.info(`Middleware added`);
        } else if (this.args.get) {
            const file = await this.sdk.middleware.getCircuitBreaker(this.args.get);
            console.info(file.toString());
        } else {
            throw new Error('Invalid arguments. Type -h for more info.');
        }
    }

    private async processMiddlewareCors(): Promise<void> {
        if (this.args.list) {
            const args: any = {};
            this.args.list.forEach((param: string) => {
                const parts = param.split(':');
                if (parts.length === 2) {
                    args[parts[0]] = parts[1];
                }
            });
            const filters = await this.sdk.middleware.corsOrigin(args['name'] as string);
            console.info(YAML.stringify(filters));
        } else if (this.args.remove) {
            await this.sdk.middleware.removeCors(this.args.remove);
            console.info(`Middleware removed`);
        } else if (this.args.update) {
            const name = this.args.update[0];
            const fileName = this.args.update[1];
            await this.sdk.middleware.updateCors(name, fileName);
            console.info(`Middleware updated`);
        } else if (this.args.add) {
            const name = this.args.add[0];
            const fileName = this.args.add[1];
            await this.sdk.middleware.addCors(name, fileName);
            console.info(`Middleware added`);
        } else if (this.args.get) {
            const file = await this.sdk.middleware.getCors(this.args.get);
            console.info(file.toString());
        } else {
            throw new Error('Invalid arguments. Type -h for more info.');
        }
    }

    private async processMiddlewareProxyRouter(): Promise<void> {
        if (this.args.list) {
            const args: any = {};
            this.args.list.forEach((param: string) => {
                const parts = param.split(':');
                if (parts.length === 2) {
                    args[parts[0]] = parts[1];
                }
            });
            const filters = await this.sdk.middleware.proxyRouter(args['name'] as string);
            console.info(YAML.stringify(filters));
        } else if (this.args.remove) {
            await this.sdk.middleware.removeProxyRouter(this.args.remove);
            console.info(`Middleware removed`);
        } else if (this.args.update) {
            const name = this.args.update[0];
            const fileName = this.args.update[1];
            await this.sdk.middleware.updateProxyRouter(name, fileName);
            console.info(`Middleware updated`);
        } else if (this.args.add) {
            const name = this.args.add[0];
            const fileName = this.args.add[1];
            await this.sdk.middleware.addProxyRouter(name, fileName);
            console.info(`Middleware added`);
        } else if (this.args.get) {
            const file = await this.sdk.middleware.getProxyRouter(this.args.get);
            console.info(file.toString());
        } else {
            throw new Error('Invalid arguments. Type -h for more info.');
        }
    }

    private async processMiddlewareServiceDiscovery(): Promise<void> {
        if (this.args.list) {
            const args: any = {};
            this.args.list.forEach((param: string) => {
                const parts = param.split(':');
                if (parts.length === 2) {
                    args[parts[0]] = parts[1];
                }
            });
            const filters = await this.sdk.middleware.serviceDiscovery(args['name'] as string);
            console.info(YAML.stringify(filters));
        } else if (this.args.remove) {
            await this.sdk.middleware.removeServiceDiscovery(this.args.remove);
            console.info(`Middleware removed`);
        } else if (this.args.update) {
            const name = this.args.update[0];
            const fileName = this.args.update[1];
            await this.sdk.middleware.updateServiceDiscovery(name, fileName);
            console.info(`Middleware updated`);
        } else if (this.args.add) {
            const name = this.args.add[0];
            const fileName = this.args.add[1];
            await this.sdk.middleware.addServiceDiscovery(name, fileName);
            console.info(`Middleware added`);
        } else if (this.args.get) {
            const file = await this.sdk.middleware.getServiceDiscovery(this.args.get);
            console.info(file.toString());
        } else {
            throw new Error('Invalid arguments. Type -h for more info.');
        }
    }

    private async processMiddlewareServiceDiscoveryProvider(): Promise<void> {
        if (this.args.list) {
            const args: any = {};
            this.args.list.forEach((param: string) => {
                const parts = param.split(':');
                if (parts.length === 2) {
                    args[parts[0]] = parts[1];
                }
            });
            const filters = await this.sdk.middleware.serviceDiscoveryProvider(args['name'] as string);
            console.info(YAML.stringify(filters));
        } else if (this.args.remove) {
            await this.sdk.middleware.removeServiceDiscoveryProvider(this.args.remove);
            console.info(`Middleware removed`);
        } else if (this.args.update) {
            const name = this.args.update[0];
            const fileName = this.args.update[1];
            await this.sdk.middleware.updateServiceDiscoveryProvider(name, fileName);
            console.info(`Middleware updated`);
        } else if (this.args.add) {
            const name = this.args.add[0];
            const fileName = this.args.add[1];
            await this.sdk.middleware.addServiceDiscoveryProvider(name, fileName);
            console.info(`Middleware added`);
        } else if (this.args.get) {
            const file = await this.sdk.middleware.getServiceDiscoveryProvider(this.args.get);
            console.info(file.toString());
        } else {
            throw new Error('Invalid arguments. Type -h for more info.');
        }
    }

    private async processMiddlewareErrorHandler(): Promise<void> {
        if (this.args.list) {
            const args: any = {};
            this.args.list.forEach((param: string) => {
                const parts = param.split(':');
                if (parts.length === 2) {
                    args[parts[0]] = parts[1];
                }
            });
            const filters = await this.sdk.middleware.errorHandler(args['name'] as string);
            console.info(YAML.stringify(filters));
        } else if (this.args.remove) {
            await this.sdk.middleware.removeErrorHandler(this.args.remove);
            console.info(`Middleware removed`);
        } else if (this.args.update) {
            const name = this.args.update[0];
            const fileName = this.args.update[1];
            await this.sdk.middleware.updateErrorHandler(name, fileName);
            console.info(`Middleware updated`);
        } else if (this.args.add) {
            const name = this.args.add[0];
            const fileName = this.args.add[1];
            await this.sdk.middleware.addErrorHandler(name, fileName);
            console.info(`Middleware added`);
        } else if (this.args.get) {
            const file = await this.sdk.middleware.getErrorHandler(this.args.get);
            console.info(file.toString());
        } else {
            throw new Error('Invalid arguments. Type -h for more info.');
        }
    }

    private async processMiddlewareRequestLogger(): Promise<void> {
        if (this.args.list) {
            const args: any = {};
            this.args.list.forEach((param: string) => {
                const parts = param.split(':');
                if (parts.length === 2) {
                    args[parts[0]] = parts[1];
                }
            });
            const filters = await this.sdk.middleware.requestLogger(args['name'] as string);
            console.info(YAML.stringify(filters));
        } else if (this.args.remove) {
            await this.sdk.middleware.removeRequestLogger(this.args.remove);
            console.info(`Middleware removed`);
        } else if (this.args.update) {
            const name = this.args.update[0];
            const fileName = this.args.update[1];
            await this.sdk.middleware.updateRequestLogger(name, fileName);
            console.info(`Middleware updated`);
        } else if (this.args.add) {
            const name = this.args.add[0];
            const fileName = this.args.add[1];
            await this.sdk.middleware.addRequestLogger(name, fileName);
            console.info(`Middleware added`);
        } else if (this.args.get) {
            const file = await this.sdk.middleware.getRequestLogger(this.args.get);
            console.info(file.toString());
        } else {
            throw new Error('Invalid arguments. Type -h for more info.');
        }
    }

    private async processApis(): Promise<void> {
        if (this.args.list) {
            const args: any = {};
            this.args.list.forEach((param: string) => {
                const parts = param.split(':');
                if (parts.length === 2) {
                    args[parts[0]] = parts[1];
                }
            });
            const apis = await this.sdk.apis.list(args);
            console.info(YAML.stringify(apis));
        } else if (this.args.add) {
            const api: ApiConfig = await this.loadConfigObject(this.args.add);
            const apiId = await this.sdk.apis.addApi(api);
            console.info(`API created. ID: ${apiId}`);
            if (api.id !== apiId) {
                api.id = apiId;
                await this.updateApiConfig(this.args.add, api);
            }
        } else if (this.args.update) {
            const api: ApiConfig = await this.loadConfigObject(this.args.update);
            await this.sdk.apis.updateApi(api.id, api);
            console.info(`API updated`);
        } else if (this.args.remove) {
            await this.sdk.apis.removeApi(this.args.remove);
            console.info(`API removed`);
        } else if (this.args.get) {
            const id = this.args.get[0];
            const format = this.args.get.length > 1 ? this.args.get[1] : 'yaml';
            const api = await this.sdk.apis.getApi(id);
            if (format === 'json') {
                console.info(JSON.stringify(api, null, 4));
            } else {
                console.info(YAML.stringify(api, 15));
            }
        } else {
            throw new Error('Invalid arguments. Type -h for more info.');
        }
    }

    private async processGateway(): Promise<void> {
        if (this.args.update) {
            const gateway: GatewayConfig = await this.loadConfigObject(this.args.update);
            await this.sdk.gateway.updateConfig(gateway);
            console.info(`Gateway config updated`);
        } else if (this.args.remove) {
            await this.sdk.gateway.removeConfig();
            console.info(`Gateway config removed`);
        } else if (this.args.get) {
            const gateway = await this.sdk.gateway.getConfig();
            if (this.args.get === 'json') {
                console.info(JSON.stringify(gateway, null, 4));
            } else {
                console.info(YAML.stringify(gateway, 15));
            }
        } else {
            throw new Error('Invalid arguments. Type -h for more info.');
        }
    }

    private async processConfig(): Promise<void> {
        if (this.args.update) {
            const config: ConfigPackage = await this.loadConfigObject(this.args.update);
            await this.sdk.config.set(config);
            console.info(`Gateway configurations imported`);
        } else if (this.args.get) {
            const config = await this.sdk.config.get();
            if (this.args.get === 'json') {
                console.info(JSON.stringify(config, null, 4));
            } else {
                console.info(YAML.stringify(config, 15));
            }
        } else {
            throw new Error('Invalid arguments. Type -h for more info.');
        }
    }

    private async loadConfigObject(fileName: string): Promise<any> {
        const nameLowerCase = fileName.toLowerCase();
        if (nameLowerCase.endsWith('.yml') || nameLowerCase.endsWith('.yaml')) {
            return YAML.load(fileName);
        } else {
            return await fs.readJSONAsync(fileName);
        }
    }

    private async updateApiConfig(fileName: string, api: ApiConfig): Promise<any> {
        const nameLowerCase = fileName.toLowerCase();
        if (nameLowerCase.endsWith('.yml') || nameLowerCase.endsWith('.yaml')) {
            return await fs.writeFileAsync(fileName, YAML.stringify(api, 15));
        } else {
            return await fs.writeJSONAsync(fileName, api);
        }
    }
}
