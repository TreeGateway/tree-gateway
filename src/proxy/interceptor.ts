'use strict';

import * as config from '../config/proxy';
import * as path from 'path';
import { ApiConfig } from '../config/api';
import * as Groups from '../group';
import { AutoWired, Inject } from 'typescript-ioc';
import { Configuration } from '../configuration';
import {createFunction} from '../utils/functions';

const pathToRegexp = require('path-to-regexp');

@AutoWired
export class ProxyInterceptor {
    @Inject
    private config: Configuration;

    requestInterceptor(api: ApiConfig) {
        if (this.hasRequestInterceptor(api.proxy)) {
            return (this.buildRequestInterceptor(api));
        }
        return null;
    }

    responseInterceptor(api: ApiConfig) {
        if (this.hasResponseInterceptor(api.proxy)) {
            return (this.buildResponseInterceptor(api));
        }
        return null;
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
            body.push(`proxyReq = require('${p}')(proxyReq, originalReq);`);
        });
        body.push(`return proxyReq;`);

        return createFunction({pathToRegexp: pathToRegexp}, 'proxyReq', 'originalReq', body.join(''));
    }

    private buildResponseInterceptor(api: ApiConfig) {
        const body = new Array<string>();
        body.push(`var continueChain = function(rsp, data, req, res, calback){ callback(null, data);};`);
        const proxy: config.Proxy = api.proxy;
        proxy.interceptor.response.forEach((interceptor, index) => {
            if (interceptor.group) {
                body.push(`var f${index};`);
                body.push(`if (`);
                body.push(Groups.buildGroupNotAllowTest('req', api.group, interceptor.group));
                body.push(`)`);
                body.push(`f${index} = continueChain;`);
                body.push(`else f${index} = `);
            } else {
                body.push(`var f${index} = `);
            }
            const p = path.join(this.config.middlewarePath, 'interceptor', 'response', interceptor.name);
            body.push(`require('${p}');`);
            body.push(`f${index}(rsp, data, req, res, (error, value)=>{ \
                if (error) { \
                   callback(error); \
                   return; \
                } \
                data = value;`
            );
        });
        proxy.interceptor.response.forEach((interceptor, index) => {
            if (index === 0) {
                body.push(`callback(null, data);`);
            }
            body.push(`});`);
        });

        return createFunction({pathToRegexp: pathToRegexp}, 'rsp', 'data', 'req', 'res', 'callback', body.join(''));
    }

    private hasRequestInterceptor(proxy: config.Proxy) {
        return (proxy.interceptor && proxy.interceptor.request && proxy.interceptor.request.length > 0);
    }

    private hasResponseInterceptor(proxy: config.Proxy) {
        return (proxy.interceptor && proxy.interceptor.response && proxy.interceptor.response.length > 0);
    }
}
