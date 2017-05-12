'use strict';

import { ApiConfig } from '../../config/api';
import { GatewayConfig } from '../../config/gateway';

const swagger = require('swagger-client');

export interface Apis {
    list(filters: any): Promise<Array<ApiConfig>>;
    addApi(api: ApiConfig): Promise<string>;
    updateApi( id: string, api: ApiConfig): Promise<void>;
    deleteApi( id: string): Promise<void>;
    getApi( id: string): Promise<ApiConfig>;
}

export interface Gateway {
    updateConfig(config: GatewayConfig): Promise<void>;
    deleteConfig(): Promise<void>;
    getConfig(): Promise<GatewayConfig>;
}

export class SDK {
    private apisClient: Apis;
    private gatewayClient: Gateway;

    private constructor(swaggerClient: any) {
        this.apisClient = new ApisClient(swaggerClient);
        this.gatewayClient = new GatewayClient(swaggerClient);
    }

    static initialize(swaggerUrl: string, login: string, password: string): Promise<SDK> {
        return new Promise<SDK>((resolve, reject) => {
            SDK.authenticate(swaggerUrl, login, password)
                .then(token => swagger(swaggerUrl, {
                    authorizations: {
                        Bearer: `JWT ${token}`
                    }
                }))
                .then((swaggerClient: any) => {
                    resolve(new SDK(swaggerClient));
                })
                .catch(reject);
        });
    }

    static authenticate(swaggerUrl: string, login: string, password: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            swagger(swaggerUrl)
                .then((swaggerClient: any) => {
                    return swaggerClient.apis.Users.UsersRestGetAuthToken({login, password});
                })
                .then((response: any) => {
                    if (response.status === 200) {
                        return resolve(response.text);
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    get apis(): Apis {
        return this.apisClient;
    }

    get gateway(): Gateway {
        return this.gatewayClient;
    }
}

class ApisClient implements Apis {
    private swaggerClient: any;

    constructor(swaggerClient: any) {
        this.swaggerClient = swaggerClient;
    }

    list(filters: any): Promise<Array<ApiConfig>> {
        return new Promise<Array<ApiConfig>>((resolve, reject) => {
            this.swaggerClient.apis.APIs.APIRestList(filters)
                .then((response: any) => {
                    if (response.status === 200) {
                        return resolve(response.body);
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    addApi(api: ApiConfig): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.swaggerClient.apis.APIs.APIRestAddApi({api})
                .then((response: any) => {
                    if (response.status === 201) {
                        return resolve(response.headers['Location'].substring(5));
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    updateApi( id: string, api: ApiConfig): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            api.id = id;
            this.swaggerClient.apis.APIs.APIRestUpdateApi({id, api})
                .then((response: any) => {
                    if (response.status === 204) {
                        return resolve();
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    deleteApi( id: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.swaggerClient.apis.APIs.APIRestDeleteApi({id})
                .then((response: any) => {
                    if (response.status === 204) {
                        return resolve();
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    getApi( id: string): Promise<ApiConfig> {
        return new Promise<ApiConfig>((resolve, reject) => {
            this.swaggerClient.apis.APIs.APIRestGetApi({id})
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

class GatewayClient implements Gateway {
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

    deleteConfig(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.swaggerClient.apis.Gateway.GatewayRestDeleteConfig({})
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
