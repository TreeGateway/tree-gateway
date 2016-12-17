"use strict";

import {Proxy} from "../config/proxy";
import * as path from "path"; 
import {ApiProxy} from "./proxy";
import {ApiConfig} from "../config/api";
import * as Groups from "../group";

let pathToRegexp = require('path-to-regexp');
 
export class ProxyFilter {
    private proxy: ApiProxy;

    constructor(proxy: ApiProxy) {
        this.proxy = proxy;
    }

    buildFilters(api: ApiConfig) {
        let filterChain = new Array<Function>();
        if (api.proxy.target.allow) {
            filterChain.push(this.buildAllowFilter(api));
        }
        if (api.proxy.target.deny) {
            filterChain.push(this.buildDenyFilter(api));
        }
        if (this.hasCustomFilter(api.proxy)) {
            filterChain.push(this.buildCustomFilter(api));
        }
        return filterChain;
    }

    private buildCustomFilter(api: ApiConfig) {
        if (this.proxy.gateway.logger.isDebugEnabled()) {
            this.proxy.gateway.logger.debug(`Configuring custom filters for Proxy target [${api.proxy.target.path}]. Filters [${JSON.stringify(api.proxy.filter)}]`);
        }
        let func = new Array<string>();
        func.push(`function(req, res){`);
        func.push(`var accepted = true;`);
        func.push(`accepted = (`);
        let proxy = api.proxy;
        proxy.filter.forEach((filter, index)=>{
            if (index > 0) {
                func.push(`&&`);                
            }
            func.push(`(`);                
            if (filter.group) {
                func.push(`!(`);
                func.push(Groups.buildGroupAllowTest('req', api.group, filter.group));
                func.push(`) ? accepted :`);                
            }
            let p = path.join(this.proxy.gateway.middlewarePath, 'filter' ,filter.name);                
            func.push(`require('${p}')(req, res)`);
            func.push(`)`);                
        });
        func.push(`);`);
        func.push(`return accepted;`);
        func.push(`}`);
        let f;
        eval(`f = ${func.join('')}`);
        return f;
    }

    private buildAllowFilter(api: ApiConfig) {
        if (this.proxy.gateway.logger.isDebugEnabled()) {
            let groups = Groups.filter(api.group, api.proxy.target.allow);
            this.proxy.gateway.logger.debug(`Configuring allow filter for Proxy target [${api.proxy.target.path}]. Groups [${JSON.stringify(groups)}]`);
        }

        return Groups.buildGroupAllowFilter(api.group, api.proxy.target.allow);
    }

    private buildDenyFilter(api: ApiConfig) {
        if (this.proxy.gateway.logger.isDebugEnabled()) {
            let groups = Groups.filter(api.group, api.proxy.target.deny);
            this.proxy.gateway.logger.debug(`Configuring deny filter for Proxy target [${api.proxy.target.path}]. Groups [${JSON.stringify(groups)}]`);
        }
        return Groups.buildGroupDenyFilter(api.group, api.proxy.target.deny);
    }

    private hasCustomFilter(proxy: Proxy) {
        return (proxy.filter && proxy.filter.length > 0);
    }
}  