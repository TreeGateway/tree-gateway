'use strict';

import { ConfigPackage } from '../../config/config-package';
import { checkStatus, getResponseBody, invoke } from './utils';

export interface Config {
    set(config: ConfigPackage): Promise<void>;
    get(): Promise<ConfigPackage>;
}

export class ConfigClient implements Config {
    private swaggerClient: any;

    constructor(swaggerClient: any) {
        this.swaggerClient = swaggerClient;
    }

    public async set(config: ConfigPackage): Promise<void> {
        const response = await invoke(this.swaggerClient.apis.Config.ConfigPackageRestSet({ config: config }));
        checkStatus(response, 204);
    }

    public async get(): Promise<ConfigPackage> {
        const response = await invoke(this.swaggerClient.apis.Config.ConfigPackageRestGet({}));
        return getResponseBody(response);
    }
}
