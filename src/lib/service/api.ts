"use strict";

import {Redis} from "ioredis";

import {ApiConfig} from "../config/api";
import {CacheConfig} from "../config/cache";
import {ThrottlingConfig} from "../config/throttling";
import {Group} from "../config/group";
import {Proxy} from "../config/proxy";
import {AuthenticationConfig} from "../config/authentication";

import {Errors} from "typescript-rest"

import {RedisService} from "./redis";

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
    update(name: string, version: string, api: ApiConfig): Promise<void>;
    remove(name: string, version: string): Promise<void>;
    get(name: string, version: string): Promise<ApiConfig>;
    getByKey(key: string): Promise<ApiConfig>;
}

export interface ApiComponentService<T> {
    list(apiName: string, apiVersion: string): Promise<Array<T>>;
    create(apiName: string, apiVersion: string, component: T): Promise<string>;
    update(apiName: string, apiVersion: string, componentId: string, component: T): Promise<void>;
    remove(apiName: string, apiVersion: string, componentId: string): Promise<void>;
    get(apiName: string, apiVersion: string, componentId: string): Promise<T>;
}

export interface GroupService extends ApiComponentService<Group> {}

export interface ThrottlingService extends ApiComponentService<ThrottlingConfig> {}

export interface CacheService extends ApiComponentService<CacheConfig> {}

export interface ProxyService {
    get(apiName: string, apiVersion: string);
    create(apiName: string, apiVersion: string, proxy: Proxy): Promise<void>;
    update(apiName: string, apiVersion: string, proxy: Proxy): Promise<void>;
    remove(apiName: string, apiVersion: string): Promise<void>;
}

export interface AuthenticationService {
    get(apiName: string, apiVersion: string);
    create(apiName: string, apiVersion: string, auth: AuthenticationConfig): Promise<void>;
    update(apiName: string, apiVersion: string, auth: AuthenticationConfig): Promise<void>;
    remove(apiName: string, apiVersion: string): Promise<void>;
}

export interface ConfigService {
    getAllApiConfig(): Promise<Array<ApiConfig>>;
    getApiConfig(apiKey: string): Promise<ApiConfig>;
}