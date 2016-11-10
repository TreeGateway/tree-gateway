"use strict";

import * as StringUtils from "underscore.string";
import {Proxy} from "../config/proxy";
import {Group} from "../config/group";
import * as Utils from "./utils";
import * as path from "path"; 
import {ApiProxy} from "./proxy";
import {ApiConfig} from "../config/api";
import * as ObjectUtils from "underscore";

let pathToRegexp = require('path-to-regexp');
 
export class ProxyFilter {
    private proxy: ApiProxy;

    constructor(proxy: ApiProxy) {
        this.proxy = proxy;
    }

    buildFilters(api: ApiConfig) {
        let filterChain = new Array<Function>();
        if (api.proxy.target.allow) {
            let groups = ObjectUtils.filter(api.group, (g: Group)=>{
                return ObjectUtils.contains(api.proxy.target.allow, g.name);
            });
            if (this.proxy.gateway.logger.isDebugEnabled()) {
                this.proxy.gateway.logger.debug('Configuring allow filter for Proxy target [%s]. Groups [%s]', 
                    api.proxy.target.path, JSON.stringify(groups));
            }
            filterChain.push(this.buildAllowFilter(groups));
        }
        if (api.proxy.target.deny) {
            let groups = ObjectUtils.filter(api.group, (g: Group)=>{
                return ObjectUtils.contains(api.proxy.target.deny, g.name);
            });
            if (this.proxy.gateway.logger.isDebugEnabled()) {
                this.proxy.gateway.logger.debug('Configuring deny filter for Proxy target [%s]. Groups [%s]', 
                    api.proxy.target.path, JSON.stringify(groups));
            }
            filterChain.push(this.buildDenyFilter(groups));
        }
        if (this.hasCustomFilter(api.proxy)) {
            if (this.proxy.gateway.logger.isDebugEnabled()) {
                this.proxy.gateway.logger.debug('Configuring custom filters for Proxy target [%s]. Filters [%s]', 
                    api.proxy.target.path, JSON.stringify(api.proxy.filter));
            }
            filterChain.push(this.buildCustomFilter(api));
        }
        return filterChain;
    }

    private buildCustomFilter(api: ApiConfig) {
        let func = new Array<string>();
        func.push("function(req, res){");
        func.push("var accepted = true;");
        func.push("accepted = (");
        let proxy = api.proxy;
        proxy.filter.forEach((filter, index)=>{
            if (index > 0) {
                func.push("&&");                
            }
            func.push("(");                
            if (filter.group) {
                func.push("!(");                
                let groups = ObjectUtils.filter(api.group, (g: Group)=>{
                    return ObjectUtils.contains(filter.group, g.name);
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
                                func.push("(req.method === '"+method.toUpperCase()+"')")
                            });
                            func.push(")");
                        }
                        if (member.path && member.path.length > 0) {
                            if (hasMethodFilter) {
                                func.push("&&");                
                            }
                            func.push("(");
                            member.path.forEach((path,i)=>{
                                if (i > 0) {
                                    func.push("||");                
                                }                
                                func.push("(pathToRegexp('"+Utils.normalizePath(path)+"').test(req.path))");
                            });
                            func.push(")");
                        }
                        func.push(")");                        
                    });
                    func.push(")");
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

    private buildAllowFilter(allow: Array<Group>) {
        let func = new Array<string>();
        func.push("function(req, res){");
        func.push("var accepted = true;");
        func.push("var targetPath = req.path;");
        allow.forEach(group=>{
            group.member.forEach(member=>{
                if (member.method && member.method.length > 0) {
                    func.push("accepted = (");
                    member.method.forEach((method, index)=>{
                        if (index > 0) {
                            func.push("||");                
                        }
                        func.push("(req.method === '"+method.toUpperCase()+"')")
                    });
                    func.push(");");
                }
                if (member.path && member.path.length > 0) {
                    func.push("if (accepted) {");
                    func.push("accepted = (");
                    member.path.forEach((path, index)=>{
                        if (index > 0) {
                            func.push("||");                
                        }                
                        func.push("(pathToRegexp('"+Utils.normalizePath(path)+"').test(targetPath))");
                    });
                    func.push(");");
                    func.push("if (accepted) {");
                    func.push("return accepted;");
                    func.push("}");
                    func.push("}");
                }
            });
        });
        
        func.push("return accepted;");
        func.push("}");
        let f;
        eval('f = '+func.join(''))
        return f;
    }

    private buildDenyFilter(deny: Array<Group>) {
        let func = new Array<string>();
        func.push("function(req, res){");
        func.push("var accepted = true;");
        func.push("var targetPath = req.path;");

        deny.forEach(group=>{
            group.member.forEach(member=>{
                if (member.method && member.method.length > 0) {
                    func.push("accepted = (");
                    member.method.forEach((method, index)=>{
                        if (index > 0) {
                            func.push("&&");                
                        }
                        func.push("(req.method !== '"+method.toUpperCase()+"')")
                    });
                    func.push(");");
                }
                if (member.path && member.path.length > 0) {
                    func.push("if (accepted) {");
                    func.push("accepted = (");
                    member.path.forEach((path, index)=>{
                        if (index > 0) {
                            func.push("&&");                
                        }                
                        func.push("!(pathToRegexp('"+Utils.normalizePath(path)+"').test(targetPath))");
                    });
                    func.push(");");
                    func.push("}");
                    func.push("if (!accepted) {");
                    func.push("return accepted;");
                    func.push("}");
                }
            });
        });
        
        func.push("return accepted;");
        func.push("}");
        let f;
        eval('f = '+func.join(''))
        return f;
    }

    private hasCustomFilter(proxy: Proxy) {
        return (proxy.filter && proxy.filter.length > 0);
    }
}  