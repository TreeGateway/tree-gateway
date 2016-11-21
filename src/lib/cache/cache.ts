"use strict";

import * as express from "express";
import {ApiConfig} from "../config/api";
import {CacheConfig, ClientCache, ServerCache} from "../config/cache";
import * as Utils from "underscore";
import * as pathUtil from "path"; 
import {Gateway} from "../gateway";
import * as Groups from "../group";
import * as StringUtils from "underscore.string";

let onHeaders = require("on-headers");
let defaults = require('defaults');

const units: any = {};

units.second = 1
units.minute = units.second * 60
units.hour = units.minute * 60
units.day = units.hour * 24
units.week = units.day * 7
units.month = units.day * 30
units.year = units.day * 365

// add plural units
Object.keys(units).forEach(function (unit) {
    units[unit + "s"] = units[unit]
})

export class ApiCache {
    private gateway: Gateway;

    constructor(gateway: Gateway) {
        this.gateway = gateway;
    }

    cache(api: ApiConfig) {
        this.clientCache(api);
    }

    private clientCache(api: ApiConfig) {
        let path: string = api.proxy.path;
        let cache: CacheConfig = api.cache;

        if (cache.client) {
            let cacheControl = this.cacheHeaderString(cache.client);
            if (this.gateway.logger.isDebugEnabled()) {
                this.gateway.logger.debug('Configuring Client Cache for path [%s].', api.proxy.path);
            }
            if (cache.group){
                if (this.gateway.logger.isDebugEnabled()) {
                    let groups = Groups.filter(api.group, cache.group);
                    this.gateway.logger.debug('Configuring Group filters for Cache on path [%s]. Groups [%s]', 
                        api.proxy.target.path, JSON.stringify(groups));
                }
                let f = Groups.buildGroupAllowFilter(api.group, cache.group);
                this.gateway.server.use(path, (req, res, next)=>{
                    if (f(req, res)){
                        onHeaders(res, ()=>{
                            res.set('Cache-Control', cacheControl);
                        });
                    }
                    next(); 
                });
            }        
            else {
                this.gateway.server.use(path, (req: express.Request, res: express.Response, next)=>{
                    if (req.method === 'GET') {
                        onHeaders(res, ()=>{
                            res.set('Cache-Control', cacheControl);
                        });
                    }
                    next(); 
                });
            }
        }
    }

    private cacheHeaderString(cache: ClientCache): string {
        let cacheConfig = defaults(cache, {
            cacheControl: 'public', 
            cacheTime: '0'
        });
        
        let cacheTime = this.calculate(cache);
        let result = new Array<string>();
        
        if (cacheTime > 0) {
            result.push(cache.cacheControl);
            if (cache.mustRevalidate) {
                result.push(',must-revalidate');
            }
            if (cache.noTransform) {
                result.push(',no-transform');
            }
            if (cache.proxyRevalidate) {
                result.push(',proxy-revalidate');
            }
            if (cache.cacheControl !== 'no-store') {
                result.push(',max-age='+cacheTime);
            }
        }
        else {
            result.push('no-store');
        }

        return result.join('');
    }

    private calculate(cache: ClientCache): number {
        let unit: string, value: number;

        let parts = StringUtils.clean(cache.cacheTime).split(' ');
        if (!parts || parts.length == 0)
        {
            this.gateway.logger.error('Invalid cacheTime [%s].', cache.cacheTime); 
            return 0;
        }
        value = parseInt(parts[0]);
        unit = (parts.length > 1?parts[1]:units[0]);

        if (!unit || !value) return 0;

        let unitValue = units[unit];
        if (!unitValue) {
            this.gateway.logger.error('Invalid cacheTime unit [%s].', unit); 
            return 0;
        }

        return unitValue * value;
    }
}
