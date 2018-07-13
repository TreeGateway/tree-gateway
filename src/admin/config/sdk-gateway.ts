'use strict';

import { GatewayConfig } from '../../config/gateway';
import { checkStatus, getResponseBody, invoke } from './utils';

export interface Gateway {
    updateConfig(config: GatewayConfig): Promise<void>;
    removeConfig(): Promise<void>;
    getConfig(): Promise<GatewayConfig>;
}

export class GatewayClient implements Gateway {
    private swaggerClient: any;

    constructor(swaggerClient: any) {
        this.swaggerClient = swaggerClient;
    }

    public async updateConfig(config: GatewayConfig): Promise<void> {
        const response = await invoke(this.swaggerClient.apis.Gateway.GatewayRestUpdateConfig({ config: config }));
        checkStatus(response, 204);
    }

    public async removeConfig(): Promise<void> {
        const response = await invoke(this.swaggerClient.apis.Gateway.GatewayRestRemoveConfig({}));
        checkStatus(response, 204);
    }

    public async getConfig(): Promise<GatewayConfig> {
        const response = await invoke(this.swaggerClient.apis.Gateway.GatewayRestGetConfig({}));
        return getResponseBody(response);
    }
}
