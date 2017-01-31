"use strict";

import {Redis} from "ioredis";

import {ApiConfig} from "../config/api";
import {CacheConfig} from "../config/cache";
import {ThrottlingConfig} from "../config/throttling";
import {CircuitBreakerConfig} from "../config/circuit-breaker";
import {ApiCorsConfig} from "../config/cors";
import {Group} from "../config/group";
import {Proxy} from "../config/proxy";
import {AuthenticationConfig} from "../config/authentication";

import {Errors} from "typescript-rest"

import {RedisService} from "./redis";

export class UnauthorizedError extends Error {
    constructor(message?: string) {
        super(message);

        this["__proto__"] = UnauthorizedError.prototype;
    }
}

export class NotFoundError extends Error {
    constructor(message?: string) {
        super(message);

        this["__proto__"] = NotFoundError.prototype;
    }
}

export class DuplicatedError extends Error {
    constructor(message?: string) {
        super(message);

        this["__proto__"] = DuplicatedError.prototype;
    }
}

export interface ApiService {
    list(): Promise<Array<ApiConfig>>;
    create(api: ApiConfig): Promise<string>;
    update(api: ApiConfig): Promise<void>;
    remove(id: string): Promise<void>;
    get(id: string): Promise<ApiConfig>;
    //getByKey(key: string): Promise<ApiConfig>;
}

export interface ApiComponentService<T> {
    list(apiId: string): Promise<Array<T>>;
    create(apiId: string, component: T): Promise<string>;
    update(apiId: string, componentId: string, component: T): Promise<void>;
    remove(apiId: string, componentId: string): Promise<void>;
    get(apiId: string, componentId: string): Promise<T>;
}

export interface GroupService extends ApiComponentService<Group> {}

export interface ThrottlingService extends ApiComponentService<ThrottlingConfig> {}

export interface CircuitBreakerService extends ApiComponentService<CircuitBreakerConfig> {}

export interface CorsService extends ApiComponentService<ApiCorsConfig> {}

export interface CacheService extends ApiComponentService<CacheConfig> {}

export interface ProxyService {
    get(apiId: string);
    create(apiId: string, proxy: Proxy): Promise<void>;
    update(apiId: string, proxy: Proxy): Promise<void>;
    remove(apiId: string): Promise<void>;
}

export interface AuthenticationService {
    get(apiId: string);
    create(apiId: string, auth: AuthenticationConfig): Promise<void>;
    update(apiId: string, auth: AuthenticationConfig): Promise<void>;
    remove(apiId: string): Promise<void>;
}

export interface ConfigService {
    getAllApiConfig(): Promise<Array<ApiConfig>>;
    getApiConfig(apiId: string): Promise<ApiConfig>;
    subscribeEvents(): Promise<void>;
}