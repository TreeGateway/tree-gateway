"use strict";

import {AuthenticationConfig, AuthenticationValidatorSchema} from "./authentication";
import {CorsConfig, CorsConfigSchema} from "./cors";
import {ThrottlingConfig, ThrottlingConfigValidatorSchema} from "./throttling";
import {CacheConfig, CacheConfigValidatorSchema} from "./cache";
import {Proxy, ProxyValidatorSchema} from "./proxy";
import {Group, GroupValidatorSchema} from "./group";
import {CircuitBreakerConfig, CircuitBreakerConfigValidatorSchema} from "./circuit-breaker";
import {ServiceDiscoveryConfig, ServiceDiscoveryConfigValidatorSchema} from "./serviceDiscovery";
import * as Joi from "joi";

/**
 * The API config descriptor.
 */
export interface ApiConfig {
    /**
     * The API ID.
     */
    id?: string;
    /**
     * The API name. Used to identify the API on admin console. 
     */
    name: string;
    /**
     * The API version. More than one version can be published for the same API.
     */
    version: string;
    /**
     * Configuration for the API proxy engine.
     */
    proxy: Proxy;
    /**
     * Configure groups of endpoints
     */
    group?: Array<Group>;
    /**
     * An optional description for API. 
     */
    description?: string;
    /**
     * Configuration for the rate limit engine.
     */
    throttling?: Array<ThrottlingConfig>;
    /**
     * Configuration for API authentication.
     */
    authentication?: AuthenticationConfig;
    /**
     * Configuration for API cache.
     */
    cache?: Array<CacheConfig>;
    /**
     * Configuration for api circuit breaker, following the pattern 
     * [Circuit Breaker](http://doc.akka.io/docs/akka/snapshot/common/circuitbreaker.html).
     */
    circuitBreaker?: Array<CircuitBreakerConfig>;
    /**
     * Configure cors support for API requests. It uses the [cors](https://www.npmjs.com/package/cors) module.
     */
    cors?: Array<CorsConfig>
    /**
     * Configuration for service discovery.
     */
    serviceDiscovery?: ServiceDiscoveryConfig;
}

export let ApiConfigValidatorSchema = Joi.object().keys({
    id: Joi.string().guid(),
    name: Joi.string().alphanum().min(3).max(30).required(),
    version: Joi.string().regex(/^(\d+\.)?(\d+\.)?(\d+)$/).required(),
    description: Joi.string(),
    proxy: ProxyValidatorSchema,
    group: Joi.array().items(GroupValidatorSchema),
    throttling: Joi.array().items(ThrottlingConfigValidatorSchema),
    authentication: AuthenticationValidatorSchema, 
    cache: Joi.array().items(CacheConfigValidatorSchema), 
    circuitBreaker: Joi.array().items(CircuitBreakerConfigValidatorSchema), 
    cors: Joi.array().items(CorsConfigSchema),
    serviceDiscovery: ServiceDiscoveryConfigValidatorSchema
});

export let SimpleApiConfigValidatorSchema = Joi.object().keys({
    id: Joi.string().guid(),
    name: Joi.string().alphanum().min(3).max(30).required(),
    version: Joi.string().regex(/^(\d+\.)?(\d+\.)?(\d+)$/).required(),
    description: Joi.string()
});

export function validateApiConfig(apiConfig: ApiConfig) {
    return new Promise((resolve, reject) => {
        Joi.validate(apiConfig, ApiConfigValidatorSchema, (err, value) => {
            if (err) {
                reject(err);
            } else {
                resolve(value);
            }
        })
    });
}

export function validateSimpleApiConfig(apiConfig: ApiConfig) {
    return new Promise((resolve, reject) => {
        Joi.validate(apiConfig, SimpleApiConfigValidatorSchema, (err, value) => {
            if (err) {
                reject(err);
            } else {
                resolve(value);
            }
        })
    });
}