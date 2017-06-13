'use strict';

import {SDK} from './sdk';
import { ApiConfig } from '../../config/api';
import { GatewayConfig } from '../../config/gateway';
import * as fs from 'fs-extra-promise';
import * as YAML from 'yamljs';

export class Cli {
    private args: any;

    constructor(configArgs: any) {
        this.args = configArgs;
    }

    processCommand() {
        this.doCommand()
            .then(() => {
                console.info(`Command ${this.args.command} completed.`);
            }).catch((err: any) => {
                console.error(`${err}`);
                process.exit(1);
            });
    }

    private doCommand(): Promise<void> {
        switch (this.args.command) {
            case 'apis':
                return this.processApis();
            case 'gateway':
                return this.processGateway();
            case 'middleware':
                return this.processMiddleware();
            default:
                return new Promise<void>((resolve, reject) => reject(`Command not found: ${this.args.command}`));
        }
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
            default:
                return new Promise<void>((resolve, reject) => reject(`Command not found: ${this.args.command}`));
        }
    }

    private processMiddlewareFilter(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            SDK.initialize(this.args.swagger, this.args.username, this.args.password)
                .then((sdk: SDK) => {
                    if (this.args.list) {
                        const args: any = {};
                        this.args.list.forEach((param: string) => {
                            const parts = param.split(':');
                            if (parts.length === 2) {
                                args[parts[0]] = parts[1];
                            }
                        });
                        sdk.middleware.filters(<string>args['name'])
                            .then(filters => {
                                console.info(JSON.stringify(filters));
                            })
                            .catch(reject);
                    } else if (this.args.remove) {
                        sdk.middleware.removeFilter(this.args.remove)
                            .then(() => {
                                console.info(`Filter removed`);
                            })
                            .catch(reject);
                    } else if (this.args.update) {
                        const name = this.args.update[0];
                        const fileName = this.args.update[1];
                        sdk.middleware.updateFilter(name, fileName)
                            .then(() => {
                                console.info(`Filter updated`);
                            })
                            .catch(reject);
                    } else if (this.args.add) {
                        const name = this.args.add[0];
                        const fileName = this.args.add[1];
                        sdk.middleware.addFilter(name, fileName)
                            .then(() => {
                                console.info(`Filter added`);
                            })
                            .catch(reject);
                    } else if (this.args.get) {
                        sdk.middleware.getFilter(this.args.get)
                            .then((file) => {
                                console.info(file.toString());
                            })
                            .catch(reject);
                    }
                });
        });
    }

    private processMiddlewareRequestInterceptor(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            SDK.initialize(this.args.swagger, this.args.username, this.args.password)
                .then((sdk: SDK) => {
                    if (this.args.list) {
                        const args: any = {};
                        this.args.list.forEach((param: string) => {
                            const parts = param.split(':');
                            if (parts.length === 2) {
                                args[parts[0]] = parts[1];
                            }
                        });
                        sdk.middleware.requestInterceptors(<string>args['name'])
                            .then(filters => {
                                console.info(JSON.stringify(filters));
                            })
                            .catch(reject);
                    } else if (this.args.remove) {
                        sdk.middleware.removeRequestInterceptor(this.args.remove)
                            .then(() => {
                                console.info(`Filter removed`);
                            })
                            .catch(reject);
                    } else if (this.args.update) {
                        const name = this.args.update[0];
                        const fileName = this.args.update[1];
                        sdk.middleware.updateRequestInterceptor(name, fileName)
                            .then(() => {
                                console.info(`Filter updated`);
                            })
                            .catch(reject);
                    } else if (this.args.add) {
                        const name = this.args.add[0];
                        const fileName = this.args.add[1];
                        sdk.middleware.addRequestInterceptor(name, fileName)
                            .then(() => {
                                console.info(`Filter added`);
                            })
                            .catch(reject);
                    } else if (this.args.get) {
                        sdk.middleware.getRequestInterceptor(this.args.get)
                            .then((file) => {
                                console.info(file.toString());
                            })
                            .catch(reject);
                    }
                });
        });
    }

    private processMiddlewareResponseInterceptor(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            SDK.initialize(this.args.swagger, this.args.username, this.args.password)
                .then((sdk: SDK) => {
                    if (this.args.list) {
                        const args: any = {};
                        this.args.list.forEach((param: string) => {
                            const parts = param.split(':');
                            if (parts.length === 2) {
                                args[parts[0]] = parts[1];
                            }
                        });
                        sdk.middleware.responseInterceptors(<string>args['name'])
                            .then(filters => {
                                console.info(JSON.stringify(filters));
                            })
                            .catch(reject);
                    } else if (this.args.remove) {
                        sdk.middleware.removeResponseInterceptor(this.args.remove)
                            .then(() => {
                                console.info(`Interceptor removed`);
                            })
                            .catch(reject);
                    } else if (this.args.update) {
                        const name = this.args.update[0];
                        const fileName = this.args.update[1];
                        sdk.middleware.updateResponseInterceptor(name, fileName)
                            .then(() => {
                                console.info(`Interceptor updated`);
                            })
                            .catch(reject);
                    } else if (this.args.add) {
                        const name = this.args.add[0];
                        const fileName = this.args.add[1];
                        sdk.middleware.addResponseInterceptor(name, fileName)
                            .then(() => {
                                console.info(`Interceptor added`);
                            })
                            .catch(reject);
                    } else if (this.args.get) {
                        sdk.middleware.getResponseInterceptor(this.args.get)
                            .then((file) => {
                                console.info(file.toString());
                            })
                            .catch(reject);
                    }
                });
        });
    }

    private processMiddlewareAuthStrategy(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            SDK.initialize(this.args.swagger, this.args.username, this.args.password)
                .then((sdk: SDK) => {
                    if (this.args.list) {
                        const args: any = {};
                        this.args.list.forEach((param: string) => {
                            const parts = param.split(':');
                            if (parts.length === 2) {
                                args[parts[0]] = parts[1];
                            }
                        });
                        sdk.middleware.authStrategies(<string>args['name'])
                            .then(filters => {
                                console.info(JSON.stringify(filters));
                            })
                            .catch(reject);
                    } else if (this.args.remove) {
                        sdk.middleware.removeAuthStrategy(this.args.remove)
                            .then(() => {
                                console.info(`Interceptor removed`);
                            })
                            .catch(reject);
                    } else if (this.args.update) {
                        const name = this.args.update[0];
                        const fileName = this.args.update[1];
                        sdk.middleware.updateAuthStrategy(name, fileName)
                            .then(() => {
                                console.info(`Interceptor updated`);
                            })
                            .catch(reject);
                    } else if (this.args.add) {
                        const name = this.args.add[0];
                        const fileName = this.args.add[1];
                        sdk.middleware.addAuthStrategy(name, fileName)
                            .then(() => {
                                console.info(`Interceptor added`);
                            })
                            .catch(reject);
                    } else if (this.args.get) {
                        sdk.middleware.getAuthStrategy(this.args.get)
                            .then((file) => {
                                console.info(file.toString());
                            })
                            .catch(reject);
                    }
                });
        });
    }

    private processMiddlewareAuthVerify(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            SDK.initialize(this.args.swagger, this.args.username, this.args.password)
                .then((sdk: SDK) => {
                    if (this.args.list) {
                        const args: any = {};
                        this.args.list.forEach((param: string) => {
                            const parts = param.split(':');
                            if (parts.length === 2) {
                                args[parts[0]] = parts[1];
                            }
                        });
                        sdk.middleware.authVerify(<string>args['name'])
                            .then(filters => {
                                console.info(JSON.stringify(filters));
                            })
                            .catch(reject);
                    } else if (this.args.remove) {
                        sdk.middleware.removeAuthVerify(this.args.remove)
                            .then(() => {
                                console.info(`Middleware removed`);
                            })
                            .catch(reject);
                    } else if (this.args.update) {
                        const name = this.args.update[0];
                        const fileName = this.args.update[1];
                        sdk.middleware.updateAuthVerify(name, fileName)
                            .then(() => {
                                console.info(`Middleware updated`);
                            })
                            .catch(reject);
                    } else if (this.args.add) {
                        const name = this.args.add[0];
                        const fileName = this.args.add[1];
                        sdk.middleware.addAuthVerify(name, fileName)
                            .then(() => {
                                console.info(`Middleware added`);
                            })
                            .catch(reject);
                    } else if (this.args.get) {
                        sdk.middleware.getAuthVerify(this.args.get)
                            .then((file) => {
                                console.info(file.toString());
                            })
                            .catch(reject);
                    }
                });
        });
    }

    private processMiddlewareThrottlingKeyGenerator(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            SDK.initialize(this.args.swagger, this.args.username, this.args.password)
                .then((sdk: SDK) => {
                    if (this.args.list) {
                        const args: any = {};
                        this.args.list.forEach((param: string) => {
                            const parts = param.split(':');
                            if (parts.length === 2) {
                                args[parts[0]] = parts[1];
                            }
                        });
                        sdk.middleware.throttlingKeyGenerator(<string>args['name'])
                            .then(filters => {
                                console.info(JSON.stringify(filters));
                            })
                            .catch(reject);
                    } else if (this.args.remove) {
                        sdk.middleware.removeThrottlingKeyGenerator(this.args.remove)
                            .then(() => {
                                console.info(`Middleware removed`);
                            })
                            .catch(reject);
                    } else if (this.args.update) {
                        const name = this.args.update[0];
                        const fileName = this.args.update[1];
                        sdk.middleware.updateThrottlingKeyGenerator(name, fileName)
                            .then(() => {
                                console.info(`Middleware updated`);
                            })
                            .catch(reject);
                    } else if (this.args.add) {
                        const name = this.args.add[0];
                        const fileName = this.args.add[1];
                        sdk.middleware.addThrottlingKeyGenerator(name, fileName)
                            .then(() => {
                                console.info(`Middleware added`);
                            })
                            .catch(reject);
                    } else if (this.args.get) {
                        sdk.middleware.getThrottlingKeyGenerator(this.args.get)
                            .then((file) => {
                                console.info(file.toString());
                            })
                            .catch(reject);
                    }
                });
        });
    }

    private processMiddlewareThrottlingHandler(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            SDK.initialize(this.args.swagger, this.args.username, this.args.password)
                .then((sdk: SDK) => {
                    if (this.args.list) {
                        const args: any = {};
                        this.args.list.forEach((param: string) => {
                            const parts = param.split(':');
                            if (parts.length === 2) {
                                args[parts[0]] = parts[1];
                            }
                        });
                        sdk.middleware.throttlingHandler(<string>args['name'])
                            .then(filters => {
                                console.info(JSON.stringify(filters));
                            })
                            .catch(reject);
                    } else if (this.args.remove) {
                        sdk.middleware.removeThrottlingHandler(this.args.remove)
                            .then(() => {
                                console.info(`Middleware removed`);
                            })
                            .catch(reject);
                    } else if (this.args.update) {
                        const name = this.args.update[0];
                        const fileName = this.args.update[1];
                        sdk.middleware.updateThrottlingHandler(name, fileName)
                            .then(() => {
                                console.info(`Middleware updated`);
                            })
                            .catch(reject);
                    } else if (this.args.add) {
                        const name = this.args.add[0];
                        const fileName = this.args.add[1];
                        sdk.middleware.addThrottlingHandler(name, fileName)
                            .then(() => {
                                console.info(`Middleware added`);
                            })
                            .catch(reject);
                    } else if (this.args.get) {
                        sdk.middleware.getThrottlingHandler(this.args.get)
                            .then((file) => {
                                console.info(file.toString());
                            })
                            .catch(reject);
                    }
                });
        });
    }

    private processMiddlewareThrottlingSkip(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            SDK.initialize(this.args.swagger, this.args.username, this.args.password)
                .then((sdk: SDK) => {
                    if (this.args.list) {
                        const args: any = {};
                        this.args.list.forEach((param: string) => {
                            const parts = param.split(':');
                            if (parts.length === 2) {
                                args[parts[0]] = parts[1];
                            }
                        });
                        sdk.middleware.throttlingSkip(<string>args['name'])
                            .then(filters => {
                                console.info(JSON.stringify(filters));
                            })
                            .catch(reject);
                    } else if (this.args.remove) {
                        sdk.middleware.removeThrottlingSkip(this.args.remove)
                            .then(() => {
                                console.info(`Middleware removed`);
                            })
                            .catch(reject);
                    } else if (this.args.update) {
                        const name = this.args.update[0];
                        const fileName = this.args.update[1];
                        sdk.middleware.updateThrottlingSkip(name, fileName)
                            .then(() => {
                                console.info(`Middleware updated`);
                            })
                            .catch(reject);
                    } else if (this.args.add) {
                        const name = this.args.add[0];
                        const fileName = this.args.add[1];
                        sdk.middleware.addThrottlingSkip(name, fileName)
                            .then(() => {
                                console.info(`Middleware added`);
                            })
                            .catch(reject);
                    } else if (this.args.get) {
                        sdk.middleware.getThrottlingSkip(this.args.get)
                            .then((file) => {
                                console.info(file.toString());
                            })
                            .catch(reject);
                    }
                });
        });
    }

    private processMiddlewareCircuitBreaker(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            SDK.initialize(this.args.swagger, this.args.username, this.args.password)
                .then((sdk: SDK) => {
                    if (this.args.list) {
                        const args: any = {};
                        this.args.list.forEach((param: string) => {
                            const parts = param.split(':');
                            if (parts.length === 2) {
                                args[parts[0]] = parts[1];
                            }
                        });
                        sdk.middleware.circuitBreaker(<string>args['name'])
                            .then(filters => {
                                console.info(JSON.stringify(filters));
                            })
                            .catch(reject);
                    } else if (this.args.remove) {
                        sdk.middleware.removeCircuitBreaker(this.args.remove)
                            .then(() => {
                                console.info(`Middleware removed`);
                            })
                            .catch(reject);
                    } else if (this.args.update) {
                        const name = this.args.update[0];
                        const fileName = this.args.update[1];
                        sdk.middleware.updateCircuitBreaker(name, fileName)
                            .then(() => {
                                console.info(`Middleware updated`);
                            })
                            .catch(reject);
                    } else if (this.args.add) {
                        const name = this.args.add[0];
                        const fileName = this.args.add[1];
                        sdk.middleware.addCircuitBreaker(name, fileName)
                            .then(() => {
                                console.info(`Middleware added`);
                            })
                            .catch(reject);
                    } else if (this.args.get) {
                        sdk.middleware.getCircuitBreakerMiddleware(this.args.get)
                            .then((file) => {
                                console.info(file.toString());
                            })
                            .catch(reject);
                    }
                });
        });
    }

    private processApis(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            SDK.initialize(this.args.swagger, this.args.username, this.args.password)
                .then((sdk: SDK) => {
                    if (this.args.list) {
                        const args: any = {};
                        this.args.list.forEach((param: string) => {
                            const parts = param.split(':');
                            if (parts.length === 2) {
                                args[parts[0]] = parts[1];
                            }
                        });
                        sdk.apis.list(args)
                            .then(apis => {
                                console.info(JSON.stringify(apis));
                            })
                            .catch(reject);
                    } else if (this.args.add) {
                        this.loadConfigObject(this.args.add)
                            .then((api: ApiConfig) => sdk.apis.addApi(api))
                            .then(apiId => {
                                console.info(`API created. ID: ${apiId}`);
                            })
                            .catch(reject);
                    } else if (this.args.update) {
                        this.loadConfigObject(this.args.update)
                            .then((api: ApiConfig) => sdk.apis.updateApi(api.id, api))
                            .then(() => {
                                console.info(`API updated`);
                            })
                            .catch(reject);
                    } else if (this.args.remove) {
                        sdk.apis.removeApi(this.args.remove)
                            .then(() => {
                                console.info(`API removed`);
                            })
                            .catch(reject);
                    } else if (this.args.get) {
                        sdk.apis.getApi(this.args.get)
                            .then(api => {
                                console.info(JSON.stringify(api));
                            })
                            .catch(reject);
                    }
                });
        });
    }

    private processGateway(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            SDK.initialize(this.args.swagger, this.args.username, this.args.password)
                .then((sdk: SDK) => {
                    if (this.args.update) {
                        this.loadConfigObject(this.args.update)
                            .then((gateway: GatewayConfig) => sdk.gateway.updateConfig(gateway))
                            .then(() => {
                                console.info(`Gateway config updated`);
                            })
                            .catch(reject);
                    } else if (this.args.remove) {
                        sdk.gateway.removeConfig()
                            .then(() => {
                                console.info(`Gateway config removed`);
                            })
                            .catch(reject);
                    } else if (this.args.get) {
                        sdk.gateway.getConfig()
                            .then(gateway => {
                                console.info(JSON.stringify(gateway));
                            })
                            .catch(reject);
                    }
                });
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
