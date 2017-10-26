'use strict';

import { ConfigPackage } from '../../config/config-package';

export interface Config {
    set(config: ConfigPackage): Promise<void>;
    get(): Promise<ConfigPackage>;
}

export class ConfigClient implements Config {
    private swaggerClient: any;

    constructor(swaggerClient: any) {
        this.swaggerClient = swaggerClient;
    }

    set(config: ConfigPackage): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.swaggerClient.apis.Config.ConfigPackageRestSet({ config })
                .then((response: any) => {
                    if (response.status === 204) {
                        return resolve();
                    }
                    reject(new Error(response.text));
                })
                .catch(reject);
        });
    }

    get(): Promise<ConfigPackage> {
        return new Promise<ConfigPackage>((resolve, reject) => {
            this.swaggerClient.apis.Config.ConfigPackageRestGet({})
                .then((response: any) => {
                    if (response.status === 200) {
                        return resolve(response.body);
                    }
                    reject(new Error(response.text));
                })
                .catch(reject);
        });
    }
}
