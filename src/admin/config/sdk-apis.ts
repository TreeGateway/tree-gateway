'use strict';

import { ApiConfig } from '../../config/api';
import { checkStatus, getCreatedResource, getResponseBody, invoke } from './utils';

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

    public async list(filters: any): Promise<Array<ApiConfig>> {
        const response = await invoke(this.swaggerClient.apis.APIs.APIRestList(filters));
        return getResponseBody(response);
    }

    public async addApi(api: ApiConfig): Promise<string> {
        const response = await invoke(this.swaggerClient.apis.APIs.APIRestAddApi({ api: api }));
        return getCreatedResource(response).substring(5);
    }

    public async updateApi(id: string, api: ApiConfig): Promise<void> {
        if (!id) {
            throw new Error('Invalid API id. To update an API, you must provide a valid ID field');
        }
        api.id = id;
        const response = await invoke(this.swaggerClient.apis.APIs.APIRestUpdateApi({ id: id, api: api }));
        checkStatus(response, 204);
    }

    public async removeApi(id: string): Promise<void> {
        if (!id) {
            throw new Error('Invalid API id. To remove an API, you must provide a valid ID');
        }
        const response = await invoke(this.swaggerClient.apis.APIs.APIRestRemoveApi({ id: id }));
        checkStatus(response, 204);
    }

    public async getApi(id: string): Promise<ApiConfig> {
        if (!id) {
            throw new Error('Invalid API id. To retrieve an API, you must provide a valid ID');
        }
        const response = await invoke(this.swaggerClient.apis.APIs.APIRestGetApi({ id: id }));
        return getResponseBody(response);
    }
}
