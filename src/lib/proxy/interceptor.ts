"use strict";

import * as StringUtils from "underscore.string";
import * as config from "../config/proxy";
import * as path from "path"; 
import * as Utils from "./utils";
import {ApiProxy} from "./proxy";
import {ApiConfig} from "../config/api";
import {Group} from "../config/group";
import * as ObjectUtils from "underscore";

let pathToRegexp = require('path-to-regexp');

export class ProxyInterceptor {
    private proxy: ApiProxy;

    constructor(proxy: ApiProxy) {
        this.proxy = proxy;
    }
    
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
        func.push("function(proxyReq, originalReq){");
        let proxy: config.Proxy = api.proxy;
        proxy.interceptor.request.forEach((interceptor, index)=>{
            let p = path.join(this.proxy.gateway.middlewarePath, 'interceptor', 'request' ,interceptor.name);                
            if (interceptor.group) {
                func.push("if (");                

                let groups = ObjectUtils.filter(api.group, (g: Group)=>{
                    return ObjectUtils.contains(interceptor.group, g.name);
                });
                groups.forEach((group,index)=>{
                    if (index > 0) {
                        func.push("||");                
                    }                
                    func.push("(");
                    group.member.forEach((member,memberIndex)=>{
                        if (memberIndex > 0) {
                            func.push("||");                
                        }                
                        func.push("(");
                        let hasMethodFilter = false;
                        if (member.method && member.method.length > 0) {
                            func.push("(");
                            hasMethodFilter = true;
                            member.method.forEach((method,i)=>{
                                if (i > 0) {
                                    func.push("||");                
                                }                
                                func.push("(originalReq.method === '"+method.toUpperCase()+"')")
                            });
                            func.push(")");
                        }

                        if (member.path && member.path.length > 0) {
                            if (hasMethodFilter) {
                                func.push("&&");                
                            }
                            func.push("(");
                            member.path.forEach((path,index)=>{
                                if (index > 0) {
                                    func.push("||");                
                                }                
                                func.push("(pathToRegexp('"+Utils.normalizePath(path)+"').test(originalReq.path))");
                            });
                            func.push(")");
                        }
                        func.push(")");                        
                    });
                    func.push(")");
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

    private buildResponseInterceptor(api: ApiConfig) {
        let func = new Array<string>();
        func.push("function(rsp, data, req, res, callback){");
        func.push("var continueChain = function(rsp, data, req, res, calback){ callback(null, data);};");
        let proxy: config.Proxy = api.proxy;
        proxy.interceptor.response.forEach((interceptor, index)=>{
            if (interceptor.group) {
                func.push("var f"+index+";");        
                func.push("if (");                
                let groups = ObjectUtils.filter(api.group, (g: Group)=>{
                    return ObjectUtils.contains(interceptor.group, g.name);
                });

                groups.forEach((group,index)=>{
                    if (index > 0) {
                        func.push("||");                
                    }                
                    func.push("(");
                    group.member.forEach((member,memberIndex)=>{
                        if (memberIndex > 0) {
                            func.push("&&");                
                        }                
                        func.push("(");
                        let hasMethodFilter = false;
                        if (member.method && member.method.length > 0) {
                            func.push("(");
                            hasMethodFilter = true;
                            member.method.forEach((method,i)=>{
                                if (i > 0) {
                                    func.push("&&");                
                                }                
                                func.push("(req.method ==! '"+method.toUpperCase()+"')")
                            });
                            func.push(")");
                        }

                        if (member.path && member.path.length > 0) {
                            if (hasMethodFilter) {
                                func.push("||");                
                            }
                            func.push("(");
                            member.path.forEach((path,index)=>{
                                if (index > 0) {
                                    func.push("&&");                
                                }                
                                func.push("!(pathToRegexp('"+Utils.normalizePath(path)+"').test(req.path))");
                            });
                            func.push(")");
                        }
                        func.push(")");                        
                    });
                    func.push(")");
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