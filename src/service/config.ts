'use strict';

import { ApiConfig } from '../config/api';

export abstract class ConfigService {
    abstract installAllMiddlewares(): Promise<void>;
    abstract getAllApiConfig(): Promise<Array<ApiConfig>>;
    abstract getApiConfig(apiId: string): Promise<ApiConfig>;
    abstract subscribeEvents(): Promise<void>;
    abstract on(event: string | symbol, listener: Function): this;
    abstract removeAllListeners(event?: string | symbol): this;
}
