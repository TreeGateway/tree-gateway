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

export abstract class ApiComponentService<T> {
    abstract list(apiId: string): Promise<Array<T>>;
    abstract create(apiId: string, component: T): Promise<string>;
    abstract update(apiId: string, componentId: string, component: T): Promise<void>;
    abstract remove(apiId: string, componentId: string): Promise<void>;
    abstract get(apiId: string, componentId: string): Promise<T>;
}

export abstract class GroupService extends ApiComponentService<Group> {}

export abstract class ThrottlingService extends ApiComponentService<ThrottlingConfig> {}

export abstract class CircuitBreakerService extends ApiComponentService<CircuitBreakerConfig> {}

export abstract class CorsService extends ApiComponentService<ApiCorsConfig> {}

export abstract class CacheService extends ApiComponentService<CacheConfig> {}

export abstract class ProxyService {
    abstract get(apiId: string);
    abstract create(apiId: string, proxy: Proxy): Promise<void>;
    abstract update(apiId: string, proxy: Proxy): Promise<void>;
    abstract remove(apiId: string): Promise<void>;
}

export abstract class AuthenticationService {
    abstract get(apiId: string);
    abstract create(apiId: string, auth: AuthenticationConfig): Promise<void>;
    abstract update(apiId: string, auth: AuthenticationConfig): Promise<void>;
    abstract remove(apiId: string): Promise<void>;
}

export abstract class ConfigService {
    abstract getAllApiConfig(): Promise<Array<ApiConfig>>;
    abstract getApiConfig(apiId: string): Promise<ApiConfig>;
    abstract subscribeEvents(): Promise<void>;
    abstract on(event: string | symbol, listener: Function): this;
}