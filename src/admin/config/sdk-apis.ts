'use strict';

import { ApiConfig } from '../../config/api';

export interface Apis {
    list(filters: any): Promise<Array<ApiConfig>>;
    addApi(api: ApiConfig): Promise<string>;
    updateApi( id: string, api: ApiConfig): Promise<void>;
    deleteApi( id: string): Promise<void>;
    getApi( id: string): Promise<ApiConfig>;
}

export class ApisClient implements Apis {
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
                        return resolve(response.headers['location'].substring(5));
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
