"use strict";

import * as StringUtils from "underscore.string";
import * as config from "../config";
import * as Utils from "./utils";
import {AutoWired, Inject} from "typescript-ioc";
import {Settings} from "../settings";
import * as path from "path"; 

let pathToRegexp = require('path-to-regexp');
 
@AutoWired
export class ProxyFilter {
    @Inject
    private settings: Settings;
    buildFilters(proxy: config.Proxy) {
        let filterChain = new Array<Function>();
        if (this.hasMethodFilter(proxy)) {
            filterChain.push(this.buildMethodFilter(proxy));
        }
        if (this.hasPathFilter(proxy)) {
          filterChain.push(this.buildPathFilter(proxy));
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
            let p = path.join(this.settings.middlewarePath, 'filter' ,filter.name);                
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

    private buildPathFilter(proxy: config.Proxy) {
        let func = new Array<string>();
        func.push("function(req, res){");
        func.push("var accepted = true;");
        func.push("var targetPath = req.path;");
        if (proxy.target.allowPath && proxy.target.allowPath.length > 0) {
            func.push("accepted = (");
            proxy.target.allowPath.forEach((path, index)=>{
                if (index > 0) {
                    func.push("||");                
                }                
                func.push("(pathToRegexp('"+Utils.normalizePath(path)+"').test(targetPath))");
            });
            func.push(");");
        }
        if (proxy.target.denyPath && proxy.target.denyPath.length > 0) {
            func.push("accepted = accepted && (");
            proxy.target.denyPath.forEach((path, index)=>{
                if (index > 0) {
                    func.push("&&");                
                }
                func.push("!(pathToRegexp('"+Utils.normalizePath(path)+"').test(targetPath))");
            });
            func.push(");");
        }
        func.push("return accepted;");
        func.push("}");
        let f;
        eval('f = '+func.join(''))
        return f;
    }

    private buildMethodFilter(proxy: config.Proxy) {
        let body = new Array<string>();
        body.push("var accepted = true;");
        if (proxy.target.allowMethod && proxy.target.allowMethod.length > 0) {
            body.push("accepted = (");
            proxy.target.allowMethod.forEach((method, index)=>{
                if (index > 0) {
                    body.push("||");                
                }
                body.push("(req.method === '"+method.toUpperCase()+"')")
            });
            body.push(");");
        }
        if (proxy.target.denyMethod && proxy.target.denyMethod.length > 0) {
            body.push("accepted = accepted && (");
            proxy.target.denyMethod.forEach((method, index) => {
                if (index > 0) {
                    body.push("&&");                
                }
                body.push("(req.method !== '"+method.toUpperCase()+"')")
            });
            body.push(");");
        }
        body.push("if (!accepted){ res.status(405);}");
        body.push("return accepted;");
        return Function("req", "res", body.join(''));
    }

    private hasCustomFilter(proxy: config.Proxy) {
        return (proxy.filter && proxy.filter.length > 0);
    }

    private hasPathFilter(proxy: config.Proxy) {
        return (proxy.target.allowPath && proxy.target.allowPath.length > 0)
            || (proxy.target.denyPath && proxy.target.denyPath.length > 0);
    }

    private hasMethodFilter(proxy: config.Proxy) {
        return (proxy.target.allowMethod && proxy.target.allowMethod.length > 0)
            || (proxy.target.denyMethod && proxy.target.denyMethod.length > 0);
    }
}  