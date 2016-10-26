"use strict";

import * as express from "express";
import * as StringUtils from "underscore.string";
import * as config from "./config";
import {AutoWired, Inject} from "typescript-ioc";
import {Settings} from "./settings";

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
        if ((proxy.filter && proxy.filter.length > 0) ||
            (proxy.target.allowPath && proxy.target.allowPath.length > 0) ||
            (proxy.target.allowMethod && proxy.target.allowMethod.length > 0) ||
            (proxy.target.denyPath && proxy.target.denyPath.length > 0) ||
            (proxy.target.denyMethod && proxy.target.denyMethod.length > 0)) {
            result['filter'] = function(req, res) {
                let result = true;

                return true;
            }; 
        }
        return result;
    }
}