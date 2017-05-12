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
            default:
                return new Promise<void>((resolve, reject) => reject(`Command not found: ${this.args.command}`));
        }
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
                        sdk.apis.deleteApi(this.args.remove)
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
                        sdk.gateway.deleteConfig()
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
