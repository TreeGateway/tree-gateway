'use strict';

import * as express from 'express';
import { ApiConfig } from '../config/api';
import { Proxy } from '../config/proxy';
import { ProxyFilter } from './filter';
import { ProxyInterceptor } from './interceptor';
import * as _ from 'lodash';
import { Logger } from '../logger';
import { AutoWired, Inject } from 'typescript-ioc';
import {getMilisecondsInterval} from '../utils/time-intervals';

const proxy = require('express-http-proxy');

/**
 * The API Proxy system. It uses [[express-http-proxy]](https://github.com/villadora/express-http-proxy)
 * to proxy requests to a target API.
 */
@AutoWired
export class ApiProxy {
    @Inject private filter: ProxyFilter;
    @Inject private interceptor: ProxyInterceptor;
    @Inject private logger: Logger;

    /**
     * Configure a proxy for a given API
     */
    proxy(apiRouter: express.Router, api: ApiConfig) {
        apiRouter.use(proxy(api.proxy.target.host, this.configureProxy(api)));
    }

    configureProxyHeader(apiRouter: express.Router, api: ApiConfig) {
        if (!api.proxy.supressViaHeader) {
            const onHeaders = require('on-headers');
            const gatewayId = 'Tree-Gateway';
            apiRouter.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
                onHeaders(res, () => {
                    let viaHeader = res.get('Via');
                    if (viaHeader) {
                        viaHeader = viaHeader + ', ' + req.httpVersion + ' ' + gatewayId;
                    } else {
                        viaHeader = req.httpVersion + ' ' + gatewayId;
                    }
                    res.set('Via', viaHeader);
                });
                next();
            });
        }
    }

    private configureProxy(api: ApiConfig) {
        const apiProxy: Proxy = api.proxy;
        const result: any = {
            forwardPath: function(req: express.Request, res: express.Response) {
                return req.url;
            }
        };
        if (apiProxy.preserveHostHdr) {
            result.preserveHostHdr = apiProxy.preserveHostHdr;
        }
        if (apiProxy.timeout) {
            result.timeout = getMilisecondsInterval(apiProxy.timeout);
        }
        if (apiProxy.https) {
            result.https = apiProxy.https;
        }
        if (apiProxy.limit) {
            result.limit = apiProxy.limit;
        }
        if (!_.isUndefined(apiProxy.memoizeHost)) {
            result.memoizeHost = apiProxy.memoizeHost;
        }
        const filterChain: Array<Function> = this.filter.buildFilters(api);
        const debug = this.logger.isDebugEnabled();
        const self = this;
        let canAccessRequestBody = false;
        let canAccessResponseBody = false;
        if (filterChain && filterChain.length > 0) {
            result.filter = function(req: express.Request, res: express.Response) {
                let filterResult = true;
                filterChain.forEach(f => {
                    if (filterResult) {
                        filterResult = f(req, res);
                    }
                    if (debug) {
                        self.logger.debug(`Filter ${(filterResult ? 'accepted' : 'rejected')} the path ${req.path}`);
                    }
                });
                return filterResult;
            };
            canAccessRequestBody = true;
        }
        const requestInterceptor: Function = this.interceptor.requestInterceptor(api);
        if (requestInterceptor) {
            result.decorateRequest = requestInterceptor;
            canAccessRequestBody = true;
        }
        const responseInterceptor: Function = this.interceptor.responseInterceptor(api);
        if (responseInterceptor) {
            result.intercept = responseInterceptor;
            canAccessResponseBody = true;
        }
        result.parseReqBody = apiProxy.parseReqBody && canAccessRequestBody;
        result.parseResBody = apiProxy.parseResBody && canAccessResponseBody;
        return result;
    }
}
