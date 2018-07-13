'use strict';

import { ApiConfig } from '../config/api';

export abstract class ApiService {
    public abstract list(name?: string, version?: string, description?: string, path?: string): Promise<Array<ApiConfig>>;
    public abstract create(api: ApiConfig): Promise<string>;
    public abstract update(api: ApiConfig, upsert?: boolean): Promise<void>;
    public abstract remove(id: string): Promise<void>;
    public abstract get(id: string): Promise<ApiConfig>;
}
