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

    updateConfig( config: GatewayConfig ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.swaggerClient.apis.Gateway.GatewayRestUpdateConfig({config})
                .then((response: any) => {
                    if (response.status === 204) {
                        return resolve();
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    removeConfig(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.swaggerClient.apis.Gateway.GatewayRestRemoveConfig({})
                .then((response: any) => {
                    if (response.status === 204) {
                        return resolve();
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    getConfig(): Promise<GatewayConfig> {
        return new Promise<GatewayConfig>((resolve, reject) => {
            this.swaggerClient.apis.Gateway.GatewayRestGetConfig({})
                .then((response: any) => {
                    if (response.status === 200) {
                        return resolve(response.body);
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }
}
