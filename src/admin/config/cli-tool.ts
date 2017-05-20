'use strict';

import {SDK} from './sdk';
import { ApiConfig } from '../../config/api';
import { GatewayConfig } from '../../config/gateway';
import * as fs from 'fs-extra-promise';

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
                        fs.readJSONAsync(this.args.add)
                            .then((api: ApiConfig) => sdk.apis.addApi(api))
                            .then(apiId => {
                                console.info(`API created. ID: ${apiId}`);
                            })
                            .catch(reject);
                    } else if (this.args.update) {
                        fs.readJSONAsync(this.args.update)
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
                        fs.readJSONAsync(this.args.update)
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
}
