'use strict';

import { ConfigPackage } from '../../config/config-package';
import { getResponseBody, checkStatus, invoke } from './utils';

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
        const response = await invoke(this.swaggerClient.apis.Config.ConfigPackageRestSet({ config }));
        checkStatus(response, 204);
    }

    async get(): Promise<ConfigPackage> {
        const response = await invoke(this.swaggerClient.apis.Config.ConfigPackageRestGet({}));
        return getResponseBody(response);
    }
}
