'use strict';

import * as config from '../config/proxy';
import * as path from 'path';
import { ApiConfig } from '../config/api';
import * as Groups from '../group';
import { AutoWired, Inject } from 'typescript-ioc';
import { Configuration } from '../configuration';
import { createFunction } from '../utils/functions';

const pathToRegexp = require('path-to-regexp');

@AutoWired
export class ProxyInterceptor {
    @Inject
    private config: Configuration;

    requestInterceptor(api: ApiConfig) {
        if (this.hasRequestInterceptor(api.proxy)) {
            return this.buildRequestInterceptor(api);
        }
        return null;
    }

    responseInterceptor(api: ApiConfig) {
        if (this.hasResponseInterceptor(api.proxy)) {
            return (this.buildResponseInterceptor(api));
        }
        return null;
    }

    hasRequestInterceptor(proxy: config.Proxy) {
        return (proxy.interceptor && proxy.interceptor.request && proxy.interceptor.request.length > 0);
    }

    hasResponseInterceptor(proxy: config.Proxy) {
        return (proxy.interceptor && proxy.interceptor.response && proxy.interceptor.response.length > 0);
    }

    private buildRequestInterceptor(api: ApiConfig) {
        const body = new Array<string>();
        const proxy: config.Proxy = api.proxy;
        proxy.interceptor.request.forEach((interceptor, index) => {
            const p = path.join(this.config.middlewarePath, 'interceptor', 'request', interceptor.name);
            if (interceptor.group) {
                body.push(`if (`);
                body.push(Groups.buildGroupAllowTest('originalReq', api.group, interceptor.group));
                body.push(`)`);
            }
            body.push(`require('${p}')(proxyReq, originalReq);`);
        });

        return createFunction({ pathToRegexp: pathToRegexp }, 'proxyReq', 'originalReq', body.join(''));
    }

    private buildResponseInterceptor(api: ApiConfig) {
        const body = new Array<string>();
        body.push(`var continueChain = function(body, headers, request){ return {body: body}; };`);
        const proxy: config.Proxy = api.proxy;
        proxy.interceptor.response.forEach((interceptor, index) => {
            if (interceptor.group) {
                body.push(`var f${index};`);
                body.push(`if (`);
                body.push(Groups.buildGroupNotAllowTest('request', api.group, interceptor.group));
                body.push(`)`);
                body.push(`f${index} = continueChain;`);
                body.push(`else f${index} = `);
            } else {
                body.push(`var f${index} = `);
            }
            const p = path.join(this.config.middlewarePath, 'interceptor', 'response', interceptor.name);
            body.push(`require('${p}');`);
            body.push(`Promise.resolve(f${index}(body, proxyRes.headers, request)).catch((error) => { \
                   callback(error); \
                   return; \
                }).then(result => { \
                    body = result.body; \
                    headersHandler(result.updateHeaders, result.removeHeaders);`
            );
        });
        proxy.interceptor.response.forEach((interceptor, index) => {
            if (index === 0) {
                body.push(`callback(null, body);`);
            }
            body.push(`});`);
        });
        return createFunction({ pathToRegexp: pathToRegexp}, 'body', 'proxyRes', 'request', 'response', 'headersHandler', 'callback', body.join(''));
    }
}
