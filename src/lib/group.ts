"use strict";

import * as ObjectUtils from "underscore";
import {Group} from "./config/group";
import * as Utils from "./proxy/utils";

let pathToRegexp = require('path-to-regexp');

export function filter(groups: Array<Group>, names: Array<string>) {
    let filtered = ObjectUtils.filter(groups, (g: Group)=>{
        return ObjectUtils.contains(names, g.name);
    });
    return filtered;
}

export function buildGroupAllowFilter(groups: Array<Group>, names: Array<string>) {
    let func = new Array<string>();
    func.push("function(req, res){");
    func.push("return "+ buildGroupAllowTest('req', groups, names));
    func.push("}");
    let f;
    eval('f = '+func.join(''))
    return f;
}

export function buildGroupAllowTest(request: string, groups: Array<Group>, names: Array<string>) {
    let func = new Array<string>();
    let filtered = filter(groups, names);
    filtered.forEach((group,index)=>{
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
                    func.push("("+request+".method === '"+method.toUpperCase()+"')")
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
                    func.push("(pathToRegexp('"+Utils.normalizePath(path)+"').test("+request+".path))");
                });
                func.push(")");
            }
            func.push(")");                        
        });
        func.push(")");
    });

    return func.join('');
}

export function buildGroupDenyFilter(groups: Array<Group>, names: Array<string>) {
    let func = new Array<string>();
    func.push("function(req, res){");
    func.push("return "+ buildGroupDenyTest('req', groups, names));
    func.push("}");
    let f;
    eval('f = '+func.join(''))
    return f;
}

export function buildGroupDenyTest(request: string, groups: Array<Group>, names: Array<string>) {
    let func = new Array<string>();
    let filtered = filter(groups, names);
    filtered.forEach((group,index)=>{
        if (index > 0) {
            func.push("&&");                
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
                    func.push("("+request+".method !== '"+method.toUpperCase()+"')")
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
                        func.push("&&");                
                    }                
                    func.push("!(pathToRegexp('"+Utils.normalizePath(path)+"').test("+request+".path))");
                });
                func.push(")");
            }
            func.push(")");                        
        });
        func.push(")");
    });

    return func.join('');
}

export function buildGroupNotAllowTest(request: string, groups: Array<Group>, names: Array<string>) {
    let func = new Array<string>();
    let filtered = filter(groups, names);

    filtered.forEach((group,index)=>{
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
                    func.push("("+request+".method ==! '"+method.toUpperCase()+"')")
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
                    func.push("!(pathToRegexp('"+Utils.normalizePath(path)+"').test("+request+".path))");
                });
                func.push(")");
            }
            func.push(")");                        
        });
        func.push(")");
    });
    return func.join('');
}