'use strict';

import {SDK} from './sdk';
import { ApiConfig } from '../../config/api';
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
                        const params = this.args.list.split('\\|');
                        params.forEach((param: string) => {
                            const parts = param.split(':');
                            if (parts.length !== 2) {
                                throw new Error(`Invalid arguments for list command: ${this.args.list}`);
                            }
                            args[parts[0]] = parts[1];
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
}
