'use strict';

import { ApiConfig } from '../../config/api';

export interface Apis {
    list(filters: any): Promise<Array<ApiConfig>>;
    addApi(api: ApiConfig): Promise<string>;
    updateApi(id: string, api: ApiConfig): Promise<void>;
    removeApi(id: string): Promise<void>;
    getApi(id: string): Promise<ApiConfig>;
}

export class ApisClient implements Apis {
    private swaggerClient: any;

    constructor(swaggerClient: any) {
        this.swaggerClient = swaggerClient;
    }

    async list(filters: any): Promise<Array<ApiConfig>> {
        const response = await this.swaggerClient.apis.APIs.APIRestList(filters);
        if (response.status !== 200) {
            throw new Error(response.text);
        }
        return response.body;
    }

    async addApi(api: ApiConfig): Promise<string> {
        const response = await this.swaggerClient.apis.APIs.APIRestAddApi({ api });
        if (response.status !== 201) {
            throw new Error(response.text);
        }
        return response.headers['location'].substring(5);
    }

    async updateApi(id: string, api: ApiConfig): Promise<void> {
        if (!id) {
            throw new Error('Invalid API id. To update an API, you must provide a valid ID field');
        }
        api.id = id;
        const response = await this.swaggerClient.apis.APIs.APIRestUpdateApi({ id, api });
        if (response.status !== 204) {
            throw new Error(response.text);
        }
    }

    async removeApi(id: string): Promise<void> {
        if (!id) {
            throw new Error('Invalid API id. To remove an API, you must provide a valid ID');
        }
        const response = await this.swaggerClient.apis.APIs.APIRestRemoveApi({ id });
        if (response.status !== 204) {
            throw new Error(response.text);
        }
    }

    async getApi(id: string): Promise<ApiConfig> {
        if (!id) {
            throw new Error('Invalid API id. To retrieve an API, you must provide a valid ID');
        }
        const response = await this.swaggerClient.apis.APIs.APIRestGetApi({ id });
        if (response.status !== 200) {
            throw new Error(response.text);
        }
        return response.body;
    }
}
