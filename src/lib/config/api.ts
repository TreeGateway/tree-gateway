"use strict";

import {AuthenticationConfig} from "./authentication";
import {ThrottlingConfig} from "./throttling";
import {Proxy} from "./proxy";
import {ServiceDiscoveryConfig} from "./serviceDiscovery";

/**
 * The API config descriptor.
 */
export interface ApiConfig {
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
     * Configuration for the rate limit engine.
     */
    throttling?: ThrottlingConfig;

    /**
     * Configuration for API authentication.
     */
    authentication?: AuthenticationConfig;

    serviceDiscovery?: ServiceDiscoveryConfig;
}