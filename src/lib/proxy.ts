"use strict";

import * as express from "express";
import * as StringUtils from "underscore.string";
import * as config from "./config";
import {AutoWired, Inject} from "typescript-ioc";
import {Settings} from "./settings";
import * as pathToRegexp from "path-to-regexp";

let proxy = require("express-http-proxy");

/**
 * The API Proxy system. It uses [[express-http-proxy]](https://github.com/villadora/express-http-proxy)
 * to proxy requests to a target API.
 */
@AutoWired
export class ApiProxy {
    @Inject
    private settings: Settings;

    /**
     * Configure a proxy for a given API
     */
    proxy(api: config.Api, ) {
        this.settings.app.use(api.proxy.path, proxy(api.proxy.target.path, this.configureProxy(api.proxy)));
    }
    
    private configureProxy(proxy: config.Proxy) {
        let result = {
            forwardPath: function(req: express.Request, res: express.Response) {
                return StringUtils.splice(req.originalUrl, 0, proxy.path.length);
            }
        };
        if (proxy.preserveHostHdr) {
            result['preserveHostHdr']  = proxy.preserveHostHdr; 
        }
        if (proxy.timeout) {
            result['timeout']  = proxy.timeout; 
        }
        if (proxy.https) {
            result['https']  = proxy.https; 
        }
        let filterChain: Array<Function> = this.buildFilters(proxy);
        if (filterChain && filterChain.length > 0) {            
            result['filter'] = function(req, res) {
                let result = true;
                filterChain.forEach(f=>{
                    if (result) {
                        result = f(req, res);
                    } 
                });
                return result;
            }; 
        }
        return result;
    }

    private buildFilters(proxy: config.Proxy) {
        let filterChain = new Array<Function>();
        if (this.hasMethodFilter(proxy)) {
            filterChain.push(this.buildMethodFilter(proxy));
        }
        if (this.hasPathFilter(proxy)) {
//            filterChain.push(this.buildPathFilter(proxy));
        }
        return filterChain;
    }

    private buildMethodFilter(proxy: config.Proxy) {
        let body = new Array<string>();
        body.push("var accepted = true;");
        if (proxy.target.allowMethod && proxy.target.allowMethod.length > 0) {
            body.push("accepted = (");
            proxy.target.allowMethod.forEach((method, index)=>{
                if (index > 0)
                {
                    body.push("||");                
                }
                body.push("(req.method === '"+StringUtils.capitalize(method)+"')")
            });
            body.push(");");
        }
        if (proxy.target.denyMethod && proxy.target.denyMethod.length > 0) {
            body.push("accepted = (");
            proxy.target.denyMethod.forEach((method, index)=>{
                if (index > 0)
                {
                    body.push("&&");                
                }
                body.push("(req.method !== '"+StringUtils.capitalize(method)+"')")
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