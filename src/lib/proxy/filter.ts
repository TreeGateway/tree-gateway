"use strict";

import * as StringUtils from "underscore.string";
import * as config from "../config/proxy";
import * as Utils from "./utils";
import * as path from "path"; 
import {ApiProxy} from "./proxy";

let pathToRegexp = require('path-to-regexp');
 
export class ProxyFilter {
    private proxy: ApiProxy;

    constructor(proxy: ApiProxy) {
        this.proxy = proxy;
    }

    buildFilters(proxy: config.Proxy) {
        let filterChain = new Array<Function>();
        if (proxy.target.allow) {
            filterChain.push(this.buildAllowFilter(proxy.target.allow));
        }
        if (proxy.target.deny) {
          filterChain.push(this.buildDenyFilter(proxy.target.deny));
        }
        if (this.hasCustomFilter(proxy)) {
          filterChain.push(this.buildCustomFilter(proxy));
        }
        return filterChain;
    }

    private buildCustomFilter(proxy: config.Proxy) {
        let func = new Array<string>();
        func.push("function(req, res){");
        func.push("var accepted = true;");
        func.push("accepted = (");
        proxy.filter.forEach((filter, index)=>{
            if (index > 0) {
                func.push("&&");                
            }
            func.push("(");                
            if (filter.appliesTo) {
                func.push("!(");                
                filter.appliesTo.forEach((path,index)=>{
                    if (index > 0) {
                        func.push("||");                
                    }                
                    func.push("(pathToRegexp('"+Utils.normalizePath(path)+"').test(req.path))");

                });
                func.push(") ? accepted :");                
            }
            let p = path.join(this.proxy.gateway.middlewarePath, 'filter' ,filter.name);                
            func.push("require('"+p+"')(req, res)");
            func.push(")");                
        });
        func.push(");");
        func.push("return accepted;");
        func.push("}");
        let f;
        eval('f = '+func.join('\n'))
        return f;
    }

    private buildAllowFilter(allow: config.TargetFilter) {
        let func = new Array<string>();
        func.push("function(req, res){");
        func.push("var accepted = true;");
        func.push("var targetPath = req.path;");
        if (allow.path && allow.path.length > 0) {
            func.push("accepted = (");
            allow.method.forEach((method, index)=>{
                if (index > 0) {
                    func.push("||");                
                }
                func.push("(req.method === '"+method.toUpperCase()+"')")
            });
            func.push(");");
        }
        if (allow.method && allow.method.length > 0) {
            func.push("if (accepted) {");
            func.push("accepted = (");
            allow.path.forEach((path, index)=>{
                if (index > 0) {
                    func.push("||");                
                }                
                func.push("(pathToRegexp('"+Utils.normalizePath(path)+"').test(targetPath))");
            });
            func.push(");");
            func.push("}");
        }
        func.push("return accepted;");
        func.push("}");
        let f;
        eval('f = '+func.join(''))
        return f;
    }

    private buildDenyFilter(deny: config.TargetFilter) {
        let func = new Array<string>();
        func.push("function(req, res){");
        func.push("var accepted = true;");
        func.push("var targetPath = req.path;");
        if (deny.path && deny.path.length > 0) {
            func.push("accepted = (");
            deny.method.forEach((method, index)=>{
                if (index > 0) {
                    func.push("&&");                
                }
                func.push("(req.method !== '"+method.toUpperCase()+"')")
            });
            func.push(");");
        }
        if (deny.method && deny.method.length > 0) {
            func.push("if (accepted) {");
            func.push("accepted = (");
            deny.path.forEach((path, index)=>{
                if (index > 0) {
                    func.push("&&");                
                }                
                func.push("!(pathToRegexp('"+Utils.normalizePath(path)+"').test(targetPath))");
            });
            func.push(");");
            func.push("}");
        }
        func.push("return accepted;");
        func.push("}");
        let f;
        eval('f = '+func.join(''))
        return f;
    }

    private hasCustomFilter(proxy: config.Proxy) {
        return (proxy.filter && proxy.filter.length > 0);
    }
}  