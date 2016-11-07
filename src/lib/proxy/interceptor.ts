"use strict";

import * as StringUtils from "underscore.string";
import * as config from "../config/proxy";
import * as path from "path"; 
import * as Utils from "./utils";
import {ApiProxy} from "./proxy";

let pathToRegexp = require('path-to-regexp');

export class ProxyInterceptor {
    private proxy: ApiProxy;

    constructor(proxy: ApiProxy) {
        this.proxy = proxy;
    }
    
    requestInterceptor(proxy: config.Proxy) {
        if (this.hasRequestInterceptor(proxy)) {
          return (this.buildRequestInterceptor(proxy));
        }
        return null;
    }

    responseInterceptor(proxy: config.Proxy) {
        if (this.hasResponseInterceptor(proxy)) {
          return (this.buildResponseInterceptor(proxy));
        }
        return null;
    }

    private buildRequestInterceptor(proxy: config.Proxy) {
        let func = new Array<string>();
        func.push("function(proxyReq, originalReq){");
        proxy.interceptor.request.forEach((interceptor, index)=>{
            let p = path.join(this.proxy.gateway.middlewarePath, 'interceptor', 'request' ,interceptor.name);                
            if (interceptor.appliesTo) {
                func.push("if (");                
                interceptor.appliesTo.forEach((path,index)=>{
                    if (index > 0) {
                        func.push("||");                
                    }                
                    func.push("(pathToRegexp('"+Utils.normalizePath(path)+"').test(originalReq.path))");

                });
                func.push(")");                
            }
            func.push("proxyReq = require('"+p+"')(proxyReq, originalReq);");
        });
        func.push("return proxyReq;");
        func.push("}");
        let f;
        eval('f = '+func.join(''))
        return f;
    }

    private buildResponseInterceptor(proxy: config.Proxy) {
        let func = new Array<string>();
        func.push("function(rsp, data, req, res, callback){");
        func.push("var continueChain = function(rsp, data, req, res, calback){ callback(null, data);};");
        proxy.interceptor.response.forEach((interceptor, index)=>{
            if (interceptor.appliesTo) {
                func.push("var f"+index+";");        
                func.push("if (");                
                interceptor.appliesTo.forEach((path,index)=>{
                    if (index > 0) {
                        func.push("&&");                
                    }                
                    func.push("!(pathToRegexp('"+Utils.normalizePath(path)+"').test(req.path))");

                });
                func.push(")");                
                func.push("f"+index+" = continueChain;");        
                func.push("else f"+index+" = ");        
            }
            else {
                func.push("var f"+index+" = ");        
            }
            let p = path.join(this.proxy.gateway.middlewarePath, 'interceptor', 'response' ,interceptor.name);                
            func.push("require('"+p+"');");
            func.push("f"+index+"(rsp, data, req, res, (error, value)=>{ \
                if (error) { \
                   callback(error); \
                   return; \
                } \
                data = value;"
            );
        });
        proxy.interceptor.response.forEach((interceptor, index)=>{
            if (index == 0) {
                func.push("callback(null, data);");
            }
            func.push("});");
        });
        func.push("}");
        let f;
        eval('f = '+func.join(''));
        return f;
    }

    private hasRequestInterceptor(proxy: config.Proxy) {
        return (proxy.interceptor && proxy.interceptor.request && proxy.interceptor.request.length > 0);
    }

    private hasResponseInterceptor(proxy: config.Proxy) {
        return (proxy.interceptor && proxy.interceptor.response && proxy.interceptor.response.length > 0);
    }
}  