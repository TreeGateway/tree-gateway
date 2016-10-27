"use strict";

import * as express from "express";
import * as fs from "fs-extra";
import * as StringUtils from "underscore.string";
import * as config from "./config";
import {ApiProxy} from "./proxy";
import {ApiRateLimit} from "./throttling";
import {Set, StringMap} from "./es5-compat";
import {Settings} from "./settings";
import {AutoWired, Inject} from "typescript-ioc";
import * as winston from "winston";

@AutoWired
export class Gateway {
    @Inject
    private settings: Settings;    
    @Inject
    private apiProxy: ApiProxy;
    @Inject
    private apiRateLimit: ApiRateLimit;
    private apis: StringMap<config.Api>;
    
    get server() : express.Application{
        return this.settings.app;
    }

    configure(path: string, ready?: () => void) {
        this.apis = new StringMap<config.Api>();
        fs.readdir(path, (err, files) => {
            if (err) {
                winston.error("Error reading directory: "+err);
            }
            else {
                path = ((StringUtils.endsWith(path, '/'))?path:path+'/');
                const length = files.length;
                files.forEach((fileName, index) =>{
                    if (StringUtils.endsWith(fileName, '.json')) {
                        fs.readJson(path+fileName, (error, apiConfig: config.Api)=>{
                            if (error) {
                                winston.error("Error reading directory: "+error);
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
        winston.info("Configuring API ["+api.name+"] on path: "+api.proxy.path);
        let apiKey: string = this.getApiKey(api);
        this.apis.set(apiKey, api);
        api.proxy.path = ApiProxy.normalizePath(api.proxy.path);
        
        if (api.throttling) {
            winston.debug("Configuring API Rate Limits");
            this.apiRateLimit.throttling(api.proxy.path, api.throttling);
        }
        winston.debug("Configuring API Proxy");
        this.apiProxy.proxy(api);
        
        if (ready) {
            ready();
        }
    }

    private getApiKey(api: config.Api) {
        return api.name + (api.version? '_'+api.version: '_default');
    }
}