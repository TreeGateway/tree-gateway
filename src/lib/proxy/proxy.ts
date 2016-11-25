"use strict";

import * as express from "express";
import * as StringUtils from "underscore.string";
import {ApiConfig} from "../config/api";
import {Proxy} from "../config/proxy";
import {ProxyFilter} from "./filter";
import {ProxyInterceptor} from "./interceptor";
import {Gateway} from "../gateway";

let proxy = require("express-http-proxy");

/**
 * The API Proxy system. It uses [[express-http-proxy]](https://github.com/villadora/express-http-proxy)
 * to proxy requests to a target API.
 */
export class ApiProxy {
    private filter: ProxyFilter;
    private interceptor: ProxyInterceptor;
    gateway: Gateway;

    constructor(gateway: Gateway) {
        this.gateway = gateway;
        this.filter = new ProxyFilter(this);
        this.interceptor = new ProxyInterceptor(this);
    }

    /**
     * Configure a proxy for a given API
     */
    proxy(api: ApiConfig) {
        this.gateway.server.use(api.proxy.path, proxy(api.proxy.target.path, this.configureProxy(api)));
    }

    configureProxyHeader(api: ApiConfig) {
        if (!api.proxy.supressViaHeader) {
            let onHeaders = require("on-headers");
            const gatewayId = 'Tree-Gateway';
            this.gateway.server.use(api.proxy.path, 
                (req: express.Request, res: express.Response, next: express.NextFunction)=>{
                    onHeaders(res, ()=>{
                        let viaHeader = res.get('Via') 
                        if (viaHeader) {
                            viaHeader = viaHeader + ', '+req.httpVersion+' '+gatewayId;
                        }
                        else {
                            viaHeader = req.httpVersion+' '+gatewayId;
                        }
                        res.set('Via', viaHeader);
                    });
                    next();
            });
        }
    }

    private configureProxy(api: ApiConfig) {
        const proxy: Proxy = api.proxy;
        let result = {
            forwardPath: function(req: express.Request, res: express.Response) {
                return req.url;
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
        let filterChain: Array<Function> = this.filter.buildFilters(api);
        let debug = this.gateway.logger.isDebugEnabled();
        let self = this;
        if (filterChain && filterChain.length > 0) {            
            result['filter'] = function(req, res) {
                let result = true;
                filterChain.forEach(f=>{
                    if (debug) {
                        self.gateway.logger.debug('Filter %s the path %s',(result?'accepted': 'rejected'),req.path);
                    }
                    if (result) {
                        result = f(req, res);
                    } 
                });
                return result;
            }; 
        }
        let requestInterceptor: Function = this.interceptor.requestInterceptor(api);
        if (requestInterceptor) {            
            result['decorateRequest'] = requestInterceptor; 
        }
        let responseInterceptor: Function = this.interceptor.responseInterceptor(api);
        if (responseInterceptor) {            
            result['intercept'] = responseInterceptor; 
        }
        return result;
    }
}