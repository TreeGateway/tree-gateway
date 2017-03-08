"use strict";

import {ApiConfig} from "../config/api";
import {CacheConfig} from "../config/cache";
import {ThrottlingConfig} from "../config/throttling";
import {CircuitBreakerConfig} from "../config/circuit-breaker";
import {ApiCorsConfig} from "../config/cors";
import {Group} from "../config/group";
import {Proxy} from "../config/proxy";
import {AuthenticationConfig} from "../config/authentication";

export abstract class ApiService {
    abstract list(): Promise<Array<ApiConfig>>;
    abstract create(api: ApiConfig): Promise<string>;
    abstract update(api: ApiConfig): Promise<void>;
    abstract remove(id: string): Promise<void>;
    abstract get(id: string): Promise<ApiConfig>;
    //abstract getByKey(key: string): Promise<ApiConfig>;
}

export abstract class ConfigService {
    abstract installAllMiddlewares(): Promise<void>;
    abstract getAllApiConfig(): Promise<Array<ApiConfig>>;
    abstract getApiConfig(apiId: string): Promise<ApiConfig>;
    abstract subscribeEvents(): Promise<void>;
    abstract on(event: string | symbol, listener: Function): this;
}