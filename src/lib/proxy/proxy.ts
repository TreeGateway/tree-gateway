"use strict";

import * as express from "express";
import {ApiConfig} from "../config/api";
import {Proxy} from "../config/proxy";
import {ProxyFilter} from "./filter";
import {ProxyInterceptor} from "./interceptor";
import * as _ from "lodash";
import {Logger} from "../logger";
import {AutoWired, Inject} from "typescript-ioc";

let proxy = require("express-http-proxy");

/**
 * The API Proxy system. It uses [[express-http-proxy]](https://github.com/villadora/express-http-proxy)
 * to proxy requests to a target API.
 */
@AutoWired
export class ApiProxy {
    @Inject
    private filter: ProxyFilter;
    @Inject
    private interceptor: ProxyInterceptor;
    @Inject
    private logger: Logger;

    /**
     * Configure a proxy for a given API
     */
    proxy(apiRouter: express.Router, api: ApiConfig) {
        apiRouter.use(proxy(api.proxy.target.host, this.configureProxy(api)));
    }

    configureProxyHeader(apiRouter: express.Router, api: ApiConfig) {
        if (!api.proxy.supressViaHeader) {
            let onHeaders = require("on-headers");
            const gatewayId = 'Tree-Gateway';
            apiRouter.use((req: express.Request, res: express.Response, next: express.NextFunction)=>{
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
        let result: any = {
            forwardPath: function(req: express.Request, res: express.Response) {
                return req.url;
            }
        };
        if (proxy.preserveHostHdr) {
            result.preserveHostHdr  = proxy.preserveHostHdr; 
        }
        if (proxy.timeout) {
            result.timeout  = proxy.timeout; 
        }
        if (proxy.https) {
            result.https  = proxy.https; 
        }
        if (proxy.limit) {
            result.limit  = proxy.limit; 
        }
        if (!_.isUndefined(proxy.memoizeHost)) {
            result.memoizeHost  = proxy.memoizeHost; 
        }
        if (proxy.disableParseReqBody) {
            result.parseReqBody  = false; 
        }
        let filterChain: Array<Function> = this.filter.buildFilters(api);
        let debug = this.logger.isDebugEnabled();
        let self = this;
        if (filterChain && filterChain.length > 0) {            
            result.filter = function(req, res) {
                let filterResult = true;
                filterChain.forEach(f=>{
                    if (filterResult) {
                        filterResult = f(req, res);
                    } 
                    if (debug) {
                        self.logger.debug(`Filter ${(filterResult?'accepted': 'rejected')} the path ${req.path}`);
                    }
                });
                return filterResult;
            }; 
        }
        let requestInterceptor: Function = this.interceptor.requestInterceptor(api);
        if (requestInterceptor) {            
            result.decorateRequest = requestInterceptor; 
        }
        let responseInterceptor: Function = this.interceptor.responseInterceptor(api);
        if (responseInterceptor) {            
            result.intercept = responseInterceptor; 
        }
        return result;
    }
}