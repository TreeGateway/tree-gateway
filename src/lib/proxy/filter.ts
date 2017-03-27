"use strict";

import {Proxy} from "../config/proxy";
import * as path from "path"; 
import {ApiConfig} from "../config/api";
import * as Groups from "../group";
import {Logger} from "../logger";
import {AutoWired, Inject} from "typescript-ioc";
import {Configuration} from "../configuration";

let pathToRegexp = require('path-to-regexp');
 
@AutoWired
export class ProxyFilter {
    @Inject
    private config: Configuration;
    @Inject
    private logger: Logger;

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
        if (this.logger.isDebugEnabled()) {
            this.logger.debug(`Configuring custom filters for Proxy target [${api.proxy.path}]. Filters [${JSON.stringify(api.proxy.filter)}]`);
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
            let p = path.join(this.config.middlewarePath, 'filter' ,filter.name);                
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
        if (this.logger.isDebugEnabled()) {
            let groups = Groups.filter(api.group, api.proxy.target.allow);
            this.logger.debug(`Configuring allow filter for Proxy target [${api.proxy.path}]. Groups [${JSON.stringify(groups)}]`);
        }

        return Groups.buildGroupAllowFilter(api.group, api.proxy.target.allow);
    }

    private buildDenyFilter(api: ApiConfig) {
        if (this.logger.isDebugEnabled()) {
            let groups = Groups.filter(api.group, api.proxy.target.deny);
            this.logger.debug(`Configuring deny filter for Proxy target [${api.proxy.path}]. Groups [${JSON.stringify(groups)}]`);
        }
        return Groups.buildGroupDenyFilter(api.group, api.proxy.target.deny);
    }

    private hasCustomFilter(proxy: Proxy) {
        return (proxy.filter && proxy.filter.length > 0);
    }
}  