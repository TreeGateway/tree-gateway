'use strict';

import { ApiConfig } from '../config/api';

export abstract class ConfigService {
    public abstract installAllMiddlewares(): Promise<void>;
    public abstract getAllApiConfig(): Promise<Array<ApiConfig>>;
    public abstract getApiConfig(apiId: string): Promise<ApiConfig>;
    public abstract subscribeEvents(): Promise<void>;
    public abstract on(event: string | symbol, listener: Function): this;
    public abstract removeAllListeners(event?: string | symbol): this;
}
