'use strict';

import { GatewayConfig } from '../../config/gateway';

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
        const response = await this.swaggerClient.apis.Gateway.GatewayRestUpdateConfig({ config });
        if (response.status !== 204) {
            throw new Error(response.text);
        }
    }

    async removeConfig(): Promise<void> {
        const response = await this.swaggerClient.apis.Gateway.GatewayRestRemoveConfig({});
        if (response.status !== 204) {
            throw new Error(response.text);
        }
    }

    async getConfig(): Promise<GatewayConfig> {
        const response = await this.swaggerClient.apis.Gateway.GatewayRestGetConfig({});
        if (response.status !== 200) {
            throw new Error(response.text);
        }
        return response.body;
    }
}
