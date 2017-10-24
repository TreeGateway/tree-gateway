'use strict';

import { SDK } from './sdk';
import { ApiConfig } from '../../config/api';
import { UserData } from '../../config/users';
import { GatewayConfig } from '../../config/gateway';
import { Configuration } from '../../configuration';
import { Inject } from 'typescript-ioc';
import * as fs from 'fs-extra-promise';
import * as YAML from 'yamljs';

export class Cli {
    @Inject private config: Configuration;

    private args: any;
    private sdk: SDK;

    constructor(configArgs: any) {
        this.args = configArgs;
    }

    processCommand(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            SDK.initialize(this.config.gateway)
                .then((sdk: SDK) => {
                    this.sdk = sdk;
                    return this.doCommand();
                })
                .then(resolve)
                .catch(reject);
        });
    }

    private doCommand(): Promise<void> {
        switch (this.args.command) {
            case 'apis':
                return this.processApis();
            case 'gateway':
                return this.processGateway();
            case 'users':
                return this.processUsers();
            case 'middleware':
                return this.processMiddleware();
            default:
                return new Promise<void>((resolve, reject) => reject(`Command not found: ${this.args.command}`));
        }
    }

    private processUsers(): Promise<void> {
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
                return new Promise<void>((resolve, reject) => reject(`Command not found: ${this.args.usersCommand}`));
        }
    }

    private processUsersAdd(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
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
            this.sdk.users.addUser(user)
                .then(() => {
                    console.info('User created.');
                    resolve();
                })
                .catch(reject);
        });
    }

    private processUsersUpdate(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
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
            this.sdk.users.updateUser(user.login, user)
                .then(() => {
                    console.info(`User updated`);
                    resolve();
                })
                .catch(reject);
        });
    }

    private processUsersRemove(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.sdk.users.removeUser(this.args.login)
                .then(() => {
                    console.info('User removed.');
                    resolve();
                })
                .catch(reject);
        });
    }

    private processUsersGet(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.sdk.users.getUser(this.args.login)
                .then(user => {
                    if (this.args.format === 'json') {
                        console.info(JSON.stringify(user, null, 4));
                    } else {
                        console.info(YAML.stringify(user, 15));
                    }
                    resolve();
                })
                .catch(reject);
        });
    }

    private processUsersList(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.args.filter = this.args.filter || [];

            const args: any = {};
            this.args.filter.forEach((param: string) => {
                const parts = param.split(':');
                if (parts.length === 2) {
                    args[parts[0]] = parts[1];
                }
            });
            this.sdk.users.list(args)
                .then((users) => {
                    console.info(YAML.stringify(users));
                    resolve();
                })
                .catch(reject);
        });
    }

    private processUsersPassword(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.sdk.users.changeUserPassword(this.args.login, this.args.password)
                .then(() => {
                    console.info('Password changed.');
                    resolve();
                })
                .catch(reject);
        });
    }

    private processMiddleware(): Promise<void> {
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
            default:
                return new Promise<void>((resolve, reject) => reject(`Command not found: ${this.args.command}`));
        }
    }

    private processMiddlewareFilter(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.args.list) {
                const args: any = {};
                this.args.list.forEach((param: string) => {
                    const parts = param.split(':');
                    if (parts.length === 2) {
                        args[parts[0]] = parts[1];
                    }
                });
                this.sdk.middleware.filters(<string>args['name'])
                    .then(filters => {
                        console.info(YAML.stringify(filters));
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.remove) {
                this.sdk.middleware.removeFilter(this.args.remove)
                    .then(() => {
                        console.info(`Filter removed`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.update) {
                const name = this.args.update[0];
                const fileName = this.args.update[1];
                this.sdk.middleware.updateFilter(name, fileName)
                    .then(() => {
                        console.info(`Filter updated`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.add) {
                const name = this.args.add[0];
                const fileName = this.args.add[1];
                this.sdk.middleware.addFilter(name, fileName)
                    .then(() => {
                        console.info(`Filter added`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.get) {
                this.sdk.middleware.getFilter(this.args.get)
                    .then((file) => {
                        console.info(file.toString());
                        resolve();
                    })
                    .catch(reject);
            }
        });
    }

    private processMiddlewareRequestInterceptor(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.args.list) {
                const args: any = {};
                this.args.list.forEach((param: string) => {
                    const parts = param.split(':');
                    if (parts.length === 2) {
                        args[parts[0]] = parts[1];
                    }
                });
                this.sdk.middleware.requestInterceptors(<string>args['name'])
                    .then(filters => {
                        console.info(YAML.stringify(filters));
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.remove) {
                this.sdk.middleware.removeRequestInterceptor(this.args.remove)
                    .then(() => {
                        console.info(`Filter removed`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.update) {
                const name = this.args.update[0];
                const fileName = this.args.update[1];
                this.sdk.middleware.updateRequestInterceptor(name, fileName)
                    .then(() => {
                        console.info(`Filter updated`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.add) {
                const name = this.args.add[0];
                const fileName = this.args.add[1];
                this.sdk.middleware.addRequestInterceptor(name, fileName)
                    .then(() => {
                        console.info(`Filter added`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.get) {
                this.sdk.middleware.getRequestInterceptor(this.args.get)
                    .then((file) => {
                        console.info(file.toString());
                        resolve();
                    })
                    .catch(reject);
            }
        });
    }

    private processMiddlewareResponseInterceptor(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.args.list) {
                const args: any = {};
                this.args.list.forEach((param: string) => {
                    const parts = param.split(':');
                    if (parts.length === 2) {
                        args[parts[0]] = parts[1];
                    }
                });
                this.sdk.middleware.responseInterceptors(<string>args['name'])
                    .then(filters => {
                        console.info(YAML.stringify(filters));
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.remove) {
                this.sdk.middleware.removeResponseInterceptor(this.args.remove)
                    .then(() => {
                        console.info(`Interceptor removed`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.update) {
                const name = this.args.update[0];
                const fileName = this.args.update[1];
                this.sdk.middleware.updateResponseInterceptor(name, fileName)
                    .then(() => {
                        console.info(`Interceptor updated`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.add) {
                const name = this.args.add[0];
                const fileName = this.args.add[1];
                this.sdk.middleware.addResponseInterceptor(name, fileName)
                    .then(() => {
                        console.info(`Interceptor added`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.get) {
                this.sdk.middleware.getResponseInterceptor(this.args.get)
                    .then((file) => {
                        console.info(file.toString());
                        resolve();
                    })
                    .catch(reject);
            }
        });
    }

    private processMiddlewareAuthStrategy(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.args.list) {
                const args: any = {};
                this.args.list.forEach((param: string) => {
                    const parts = param.split(':');
                    if (parts.length === 2) {
                        args[parts[0]] = parts[1];
                    }
                });
                this.sdk.middleware.authStrategies(<string>args['name'])
                    .then(filters => {
                        console.info(YAML.stringify(filters));
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.remove) {
                this.sdk.middleware.removeAuthStrategy(this.args.remove)
                    .then(() => {
                        console.info(`Interceptor removed`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.update) {
                const name = this.args.update[0];
                const fileName = this.args.update[1];
                this.sdk.middleware.updateAuthStrategy(name, fileName)
                    .then(() => {
                        console.info(`Interceptor updated`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.add) {
                const name = this.args.add[0];
                const fileName = this.args.add[1];
                this.sdk.middleware.addAuthStrategy(name, fileName)
                    .then(() => {
                        console.info(`Interceptor added`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.get) {
                this.sdk.middleware.getAuthStrategy(this.args.get)
                    .then((file) => {
                        console.info(file.toString());
                        resolve();
                    })
                    .catch(reject);
            }
        });
    }

    private processMiddlewareAuthVerify(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.args.list) {
                const args: any = {};
                this.args.list.forEach((param: string) => {
                    const parts = param.split(':');
                    if (parts.length === 2) {
                        args[parts[0]] = parts[1];
                    }
                });
                this.sdk.middleware.authVerify(<string>args['name'])
                    .then(filters => {
                        console.info(YAML.stringify(filters));
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.remove) {
                this.sdk.middleware.removeAuthVerify(this.args.remove)
                    .then(() => {
                        console.info(`Middleware removed`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.update) {
                const name = this.args.update[0];
                const fileName = this.args.update[1];
                this.sdk.middleware.updateAuthVerify(name, fileName)
                    .then(() => {
                        console.info(`Middleware updated`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.add) {
                const name = this.args.add[0];
                const fileName = this.args.add[1];
                this.sdk.middleware.addAuthVerify(name, fileName)
                    .then(() => {
                        console.info(`Middleware added`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.get) {
                this.sdk.middleware.getAuthVerify(this.args.get)
                    .then((file) => {
                        console.info(file.toString());
                        resolve();
                    })
                    .catch(reject);
            }
        });
    }

    private processMiddlewareThrottlingKeyGenerator(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.args.list) {
                const args: any = {};
                this.args.list.forEach((param: string) => {
                    const parts = param.split(':');
                    if (parts.length === 2) {
                        args[parts[0]] = parts[1];
                    }
                });
                this.sdk.middleware.throttlingKeyGenerator(<string>args['name'])
                    .then(filters => {
                        console.info(YAML.stringify(filters));
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.remove) {
                this.sdk.middleware.removeThrottlingKeyGenerator(this.args.remove)
                    .then(() => {
                        console.info(`Middleware removed`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.update) {
                const name = this.args.update[0];
                const fileName = this.args.update[1];
                this.sdk.middleware.updateThrottlingKeyGenerator(name, fileName)
                    .then(() => {
                        console.info(`Middleware updated`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.add) {
                const name = this.args.add[0];
                const fileName = this.args.add[1];
                this.sdk.middleware.addThrottlingKeyGenerator(name, fileName)
                    .then(() => {
                        console.info(`Middleware added`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.get) {
                this.sdk.middleware.getThrottlingKeyGenerator(this.args.get)
                    .then((file) => {
                        console.info(file.toString());
                        resolve();
                    })
                    .catch(reject);
            }
        });
    }

    private processMiddlewareThrottlingHandler(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.args.list) {
                const args: any = {};
                this.args.list.forEach((param: string) => {
                    const parts = param.split(':');
                    if (parts.length === 2) {
                        args[parts[0]] = parts[1];
                    }
                });
                this.sdk.middleware.throttlingHandler(<string>args['name'])
                    .then(filters => {
                        console.info(YAML.stringify(filters));
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.remove) {
                this.sdk.middleware.removeThrottlingHandler(this.args.remove)
                    .then(() => {
                        console.info(`Middleware removed`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.update) {
                const name = this.args.update[0];
                const fileName = this.args.update[1];
                this.sdk.middleware.updateThrottlingHandler(name, fileName)
                    .then(() => {
                        console.info(`Middleware updated`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.add) {
                const name = this.args.add[0];
                const fileName = this.args.add[1];
                this.sdk.middleware.addThrottlingHandler(name, fileName)
                    .then(() => {
                        console.info(`Middleware added`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.get) {
                this.sdk.middleware.getThrottlingHandler(this.args.get)
                    .then((file) => {
                        console.info(file.toString());
                        resolve();
                    })
                    .catch(reject);
            }
        });
    }

    private processMiddlewareThrottlingSkip(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.args.list) {
                const args: any = {};
                this.args.list.forEach((param: string) => {
                    const parts = param.split(':');
                    if (parts.length === 2) {
                        args[parts[0]] = parts[1];
                    }
                });
                this.sdk.middleware.throttlingSkip(<string>args['name'])
                    .then(filters => {
                        console.info(YAML.stringify(filters));
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.remove) {
                this.sdk.middleware.removeThrottlingSkip(this.args.remove)
                    .then(() => {
                        console.info(`Middleware removed`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.update) {
                const name = this.args.update[0];
                const fileName = this.args.update[1];
                this.sdk.middleware.updateThrottlingSkip(name, fileName)
                    .then(() => {
                        console.info(`Middleware updated`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.add) {
                const name = this.args.add[0];
                const fileName = this.args.add[1];
                this.sdk.middleware.addThrottlingSkip(name, fileName)
                    .then(() => {
                        console.info(`Middleware added`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.get) {
                this.sdk.middleware.getThrottlingSkip(this.args.get)
                    .then((file) => {
                        console.info(file.toString());
                        resolve();
                    })
                    .catch(reject);
            }
        });
    }

    private processMiddlewareCircuitBreaker(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.args.list) {
                const args: any = {};
                this.args.list.forEach((param: string) => {
                    const parts = param.split(':');
                    if (parts.length === 2) {
                        args[parts[0]] = parts[1];
                    }
                });
                this.sdk.middleware.circuitBreaker(<string>args['name'])
                    .then(filters => {
                        console.info(YAML.stringify(filters));
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.remove) {
                this.sdk.middleware.removeCircuitBreaker(this.args.remove)
                    .then(() => {
                        console.info(`Middleware removed`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.update) {
                const name = this.args.update[0];
                const fileName = this.args.update[1];
                this.sdk.middleware.updateCircuitBreaker(name, fileName)
                    .then(() => {
                        console.info(`Middleware updated`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.add) {
                const name = this.args.add[0];
                const fileName = this.args.add[1];
                this.sdk.middleware.addCircuitBreaker(name, fileName)
                    .then(() => {
                        console.info(`Middleware added`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.get) {
                this.sdk.middleware.getCircuitBreakerMiddleware(this.args.get)
                    .then((file) => {
                        console.info(file.toString());
                        resolve();
                    })
                    .catch(reject);
            }
        });
    }

    private processMiddlewareCors(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.args.list) {
                const args: any = {};
                this.args.list.forEach((param: string) => {
                    const parts = param.split(':');
                    if (parts.length === 2) {
                        args[parts[0]] = parts[1];
                    }
                });
                this.sdk.middleware.corsOrigin(<string>args['name'])
                    .then(filters => {
                        console.info(YAML.stringify(filters));
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.remove) {
                this.sdk.middleware.removeCors(this.args.remove)
                    .then(() => {
                        console.info(`Middleware removed`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.update) {
                const name = this.args.update[0];
                const fileName = this.args.update[1];
                this.sdk.middleware.updateCors(name, fileName)
                    .then(() => {
                        console.info(`Middleware updated`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.add) {
                const name = this.args.add[0];
                const fileName = this.args.add[1];
                this.sdk.middleware.addCors(name, fileName)
                    .then(() => {
                        console.info(`Middleware added`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.get) {
                this.sdk.middleware.getCorsMiddleware(this.args.get)
                    .then((file) => {
                        console.info(file.toString());
                        resolve();
                    })
                    .catch(reject);
            }
        });
    }

    private processMiddlewareProxyRouter(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.args.list) {
                const args: any = {};
                this.args.list.forEach((param: string) => {
                    const parts = param.split(':');
                    if (parts.length === 2) {
                        args[parts[0]] = parts[1];
                    }
                });
                this.sdk.middleware.proxyRouter(<string>args['name'])
                    .then(filters => {
                        console.info(YAML.stringify(filters));
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.remove) {
                this.sdk.middleware.removeProxyRouter(this.args.remove)
                    .then(() => {
                        console.info(`Middleware removed`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.update) {
                const name = this.args.update[0];
                const fileName = this.args.update[1];
                this.sdk.middleware.updateProxyRouter(name, fileName)
                    .then(() => {
                        console.info(`Middleware updated`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.add) {
                const name = this.args.add[0];
                const fileName = this.args.add[1];
                this.sdk.middleware.addProxyRouter(name, fileName)
                    .then(() => {
                        console.info(`Middleware added`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.get) {
                this.sdk.middleware.getProxyRouterMiddleware(this.args.get)
                    .then((file) => {
                        console.info(file.toString());
                        resolve();
                    })
                    .catch(reject);
            }
        });
    }

    private processMiddlewareServiceDiscovery(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.args.list) {
                const args: any = {};
                this.args.list.forEach((param: string) => {
                    const parts = param.split(':');
                    if (parts.length === 2) {
                        args[parts[0]] = parts[1];
                    }
                });
                this.sdk.middleware.serviceDiscovery(<string>args['name'])
                    .then(filters => {
                        console.info(YAML.stringify(filters));
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.remove) {
                this.sdk.middleware.removeServiceDiscovery(this.args.remove)
                    .then(() => {
                        console.info(`Middleware removed`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.update) {
                const name = this.args.update[0];
                const fileName = this.args.update[1];
                this.sdk.middleware.updateServiceDiscovery(name, fileName)
                    .then(() => {
                        console.info(`Middleware updated`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.add) {
                const name = this.args.add[0];
                const fileName = this.args.add[1];
                this.sdk.middleware.addServiceDiscovery(name, fileName)
                    .then(() => {
                        console.info(`Middleware added`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.get) {
                this.sdk.middleware.getServiceDiscoveryMiddleware(this.args.get)
                    .then((file) => {
                        console.info(file.toString());
                        resolve();
                    })
                    .catch(reject);
            }
        });
    }

    private processMiddlewareServiceDiscoveryProvider(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.args.list) {
                const args: any = {};
                this.args.list.forEach((param: string) => {
                    const parts = param.split(':');
                    if (parts.length === 2) {
                        args[parts[0]] = parts[1];
                    }
                });
                this.sdk.middleware.serviceDiscoveryProvider(<string>args['name'])
                    .then(filters => {
                        console.info(YAML.stringify(filters));
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.remove) {
                this.sdk.middleware.removeServiceDiscoveryProvider(this.args.remove)
                    .then(() => {
                        console.info(`Middleware removed`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.update) {
                const name = this.args.update[0];
                const fileName = this.args.update[1];
                this.sdk.middleware.updateServiceDiscoveryProvider(name, fileName)
                    .then(() => {
                        console.info(`Middleware updated`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.add) {
                const name = this.args.add[0];
                const fileName = this.args.add[1];
                this.sdk.middleware.addServiceDiscoveryProvider(name, fileName)
                    .then(() => {
                        console.info(`Middleware added`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.get) {
                this.sdk.middleware.getServiceDiscoveryProviderMiddleware(this.args.get)
                    .then((file) => {
                        console.info(file.toString());
                        resolve();
                    })
                    .catch(reject);
            }
        });
    }

    private processApis(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.args.list) {
                const args: any = {};
                this.args.list.forEach((param: string) => {
                    const parts = param.split(':');
                    if (parts.length === 2) {
                        args[parts[0]] = parts[1];
                    }
                });
                this.sdk.apis.list(args)
                    .then(apis => {
                        console.info(YAML.stringify(apis));
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.add) {
                this.loadConfigObject(this.args.add)
                    .then((api: ApiConfig) => this.sdk.apis.addApi(api))
                    .then(apiId => {
                        console.info(`API created. ID: ${apiId}`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.update) {
                this.loadConfigObject(this.args.update)
                    .then((api: ApiConfig) => this.sdk.apis.updateApi(api.id, api))
                    .then(() => {
                        console.info(`API updated`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.remove) {
                this.sdk.apis.removeApi(this.args.remove)
                    .then(() => {
                        console.info(`API removed`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.get) {
                const id = this.args.get[0];
                const format = this.args.get.length > 1 ? this.args.get[1] : 'yaml';
                this.sdk.apis.getApi(id)
                    .then(api => {
                        if (format === 'json') {
                            console.info(JSON.stringify(api, null, 4));
                        } else {
                            console.info(YAML.stringify(api, 15));
                        }
                        resolve();
                    })
                    .catch(reject);
            }
        });
    }

    private processGateway(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.args.update) {
                this.loadConfigObject(this.args.update)
                    .then((gateway: GatewayConfig) => this.sdk.gateway.updateConfig(gateway))
                    .then(() => {
                        console.info(`Gateway config updated`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.remove) {
                this.sdk.gateway.removeConfig()
                    .then(() => {
                        console.info(`Gateway config removed`);
                        resolve();
                    })
                    .catch(reject);
            } else if (this.args.get) {
                this.sdk.gateway.getConfig()
                    .then(gateway => {
                        if (this.args.get === 'json') {
                            console.info(JSON.stringify(gateway, null, 4));
                        } else {
                            console.info(YAML.stringify(gateway, 15));
                        }
                        resolve();
                    })
                    .catch(reject);
            }
        });
    }

    private loadConfigObject(fileName: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const nameLowerCase = fileName.toLowerCase();
            if (nameLowerCase.endsWith('.yml') || nameLowerCase.endsWith('.yaml')) {
                resolve(YAML.load(fileName));
            } else {
                fs.readJSONAsync(fileName).then(resolve).catch(reject);
            }
        });
    }
}
