"use strict";

import * as express from "express";
import * as fs from "fs-extra";
import * as StringUtils from "underscore.string";
import * as config from "./config";
import {ApiProxy} from "./proxy/proxy";
import * as Utils from "./proxy/utils";
import {ApiRateLimit} from "./throttling/throttling";
import {ApiAuth} from "./authentication/auth";
import {Set, StringMap} from "./es5-compat";
import {Settings} from "./settings";
import {AutoWired, Inject, Singleton} from "typescript-ioc";

@AutoWired
@Singleton
export class Gateway {
    @Inject
    private apiProxy: ApiProxy;
    @Inject
    private apiRateLimit: ApiRateLimit;
    @Inject
    private apiAuth: ApiAuth;
    private apis: StringMap<config.Api>;
    private settings: Settings;

    constructor(@Inject settings: Settings) {
        this.settings = settings;
    }    
    
    get server() : express.Application{
        return this.settings.app;
    }

    initialize(ready?: () => void) {
        this.apis = new StringMap<config.Api>();
        let path = this.settings.apiPath;
        fs.readdir(path, (err, files) => {
            if (err) {
                this.settings.logger.error("Error reading directory: "+err);
            }
            else {
                path = ((StringUtils.endsWith(path, '/'))?path:path+'/');
                const length = files.length;
                files.forEach((fileName, index) =>{
                    if (StringUtils.endsWith(fileName, '.json')) {
                        fs.readJson(path+fileName, (error, apiConfig: config.Api)=>{
                            if (error) {
                                this.settings.logger.error("Error reading directory: "+error);
                            }
                            else {
                                this.loadApi(apiConfig, (length -1 === index)?ready: null);
                            }
                        });
                    }
                });
            }
        });
    }

    loadApi(api: config.Api, ready?: () => void) {
        this.settings.logger.info("Configuring API ["+api.name+"] on path: "+api.proxy.path);
        let apiKey: string = this.getApiKey(api);
        this.apis.set(apiKey, api);
        api.proxy.path = Utils.normalizePath(api.proxy.path);
        
        if (api.throttling) {
            this.settings.logger.debug("Configuring API Rate Limits");
            this.apiRateLimit.throttling(api.proxy.path, api.throttling);
        }
        if (api.authentication) {
            this.settings.logger.debug("Configuring API Authentication");
            this.apiAuth.authentication(apiKey, api.proxy.path, api.authentication);
        }
        this.settings.logger.debug("Configuring API Proxy");
        this.apiProxy.proxy(api);
        
        if (ready) {
            ready();
        }
    }

    private getApiKey(api: config.Api) {
        return api.name + (api.version? '_'+api.version: '_default');
    }
}
/*TODO: 
- Create a file for Gateway configurations:
  - Global interceptors / Filters / Throttling
- Create a global interceptor to add a 'Via' header pointing to Tree-Gateway
- Expose an Admin port
- Manage API versions
- Fix the log (winston is not logging on log file, but just on consoles)
- Create a clsuter program, to initialize the app in cluster
*/