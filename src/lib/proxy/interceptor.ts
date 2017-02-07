"use strict";

import * as config from "../config/proxy";
import * as path from "path"; 
import {ApiConfig} from "../config/api";
import * as Groups from "../group";
import {AutoWired, Inject} from "typescript-ioc";
import {Configuration} from "../configuration";

let pathToRegexp = require('path-to-regexp');

@AutoWired
export class ProxyInterceptor {
    @Inject
    private config: Configuration;
    
    requestInterceptor(api: ApiConfig) {
        if (this.hasRequestInterceptor(api.proxy)) {
          return (this.buildRequestInterceptor(api));
        }
        return null;
    }

    responseInterceptor(api: ApiConfig) {
        if (this.hasResponseInterceptor(api.proxy)) {
          return (this.buildResponseInterceptor(api));
        }
        return null;
    }

    private buildRequestInterceptor(api: ApiConfig) {
        let func = new Array<string>();
        func.push(`function(proxyReq, originalReq){`);
        let proxy: config.Proxy = api.proxy;
        proxy.interceptor.request.forEach((interceptor, index)=>{
            let p = path.join(this.config.gateway.middlewarePath, 'interceptor', 'request' ,interceptor.name);                
            if (interceptor.group) {
                func.push(`if (`);                
                func.push(Groups.buildGroupAllowTest('originalReq', api.group, interceptor.group));
                func.push(`)`);                
            }
            func.push(`proxyReq = require('${p}')(proxyReq, originalReq);`);
        });
        func.push(`return proxyReq;`);
        func.push(`}`);
        let f;
        eval(`f = ${func.join('')}`);
        return f;
    }

    private buildResponseInterceptor(api: ApiConfig) {
        let func = new Array<string>();
        func.push(`function(rsp, data, req, res, callback){`);
        func.push(`var continueChain = function(rsp, data, req, res, calback){ callback(null, data);};`);
        let proxy: config.Proxy = api.proxy;
        proxy.interceptor.response.forEach((interceptor, index)=>{
            if (interceptor.group) {
                func.push(`var f${index};`);        
                func.push(`if (`);                
                func.push(Groups.buildGroupNotAllowTest('req', api.group, interceptor.group));
                func.push(`)`);                
                func.push(`f${index} = continueChain;`);        
                func.push(`else f${index} = `);        
            }
            else {
                func.push(`var f${index} = `);        
            }
            let p = path.join(this.config.gateway.middlewarePath, 'interceptor', 'response' ,interceptor.name);                
            func.push(`require('${p}');`);
            func.push(`f${index}(rsp, data, req, res, (error, value)=>{ \
                if (error) { \
                   callback(error); \
                   return; \
                } \
                data = value;`
            );
        });
        proxy.interceptor.response.forEach((interceptor, index)=>{
            if (index == 0) {
                func.push(`callback(null, data);`);
            }
            func.push(`});`);
        });
        func.push(`}`);
        let f;
        eval(`f = ${func.join('')}`);
        return f;
    }

    private hasRequestInterceptor(proxy: config.Proxy) {
        return (proxy.interceptor && proxy.interceptor.request && proxy.interceptor.request.length > 0);
    }

    private hasResponseInterceptor(proxy: config.Proxy) {
        return (proxy.interceptor && proxy.interceptor.response && proxy.interceptor.response.length > 0);
    }
}  