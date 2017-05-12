'use strict';

import { ApiConfig } from '../config/api';

export abstract class ApiService {
    abstract list(name?: string, version?: string, description?: string, path?: string): Promise<Array<ApiConfig>>;
    abstract create(api: ApiConfig): Promise<string>;
    abstract update(api: ApiConfig): Promise<void>;
    abstract remove(id: string): Promise<void>;
    abstract get(id: string): Promise<ApiConfig>;
    // abstract getByKey(key: string): Promise<ApiConfig>;
}

export abstract class ConfigService {
    abstract installAllMiddlewares(): Promise<void>;
    abstract getAllApiConfig(): Promise<Array<ApiConfig>>;
    abstract getApiConfig(apiId: string): Promise<ApiConfig>;
    abstract subscribeEvents(): Promise<void>;
    abstract on(event: string | symbol, listener: Function): this;
    abstract removeAllListeners(event?: string | symbol): this;
}
