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

    async set(config: ConfigPackage): Promise<void> {
        const response = await this.swaggerClient.apis.Config.ConfigPackageRestSet({ config });
        if (response.status !== 204) {
            throw new Error(response.text);
        }
    }

    async get(): Promise<ConfigPackage> {
        const response = await this.swaggerClient.apis.Config.ConfigPackageRestGet({});
        if (response.status !== 200) {
            throw new Error(response.text);
        }
        return response.body;
    }
}
