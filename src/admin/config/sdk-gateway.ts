'use strict';

import { GatewayConfig } from '../../config/gateway';
import { checkStatus, invoke, getResponseBody } from './utils';

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

    async updateConfig(config: GatewayConfig): Promise<void> {
        const response = await invoke(this.swaggerClient.apis.Gateway.GatewayRestUpdateConfig({ config }));
        checkStatus(response, 204);
    }

    async removeConfig(): Promise<void> {
        const response = await invoke(this.swaggerClient.apis.Gateway.GatewayRestRemoveConfig({}));
        checkStatus(response, 204);
    }

    async getConfig(): Promise<GatewayConfig> {
        const response = await invoke(this.swaggerClient.apis.Gateway.GatewayRestGetConfig({}));
        return getResponseBody(response);
    }
}
