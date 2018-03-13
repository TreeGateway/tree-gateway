'use strict';

import * as express from 'express';
import { ApiConfig } from '../../config/api';
import * as Groups from '../group';
import { Inject } from 'typescript-ioc';
import { Logger } from '../../logger';
import { createFunction } from '../../utils/functions';
import { MiddlewareLoader } from '../../utils/middleware-loader';
import * as mm from 'micromatch';

export interface ResponseInterceptors {
    middelware: Function;
    validators: Array<Function>;
}

export class ProxyInterceptor {
    @Inject private middlewareLoader: MiddlewareLoader;
    @Inject private logger: Logger;

    buildRequestInterceptors(apiRouter: express.Router, api: ApiConfig) {
        if (this.hasRequestInterceptor(api)) {
            this.createRequestInterceptors(apiRouter, api);
        }
    }

    responseInterceptor(api: ApiConfig) {
        if (this.hasResponseInterceptor(api)) {
            return (this.buildResponseInterceptor(api));
        }
        return null;
    }

    hasRequestInterceptor(api: ApiConfig) {
        return (api.interceptor && api.interceptor.request && api.interceptor.request.length > 0);
    }

    hasResponseInterceptor(api: ApiConfig) {
        return (api.interceptor && api.interceptor.response && api.interceptor.response.length > 0);
    }

    private createRequestInterceptors(apiRouter: express.Router, api: ApiConfig) {
        if (this.logger.isDebugEnabled()) {
            this.logger.debug(`Configuring request interceptors for Proxy target [${api.path}]. Interceptors [${JSON.stringify(api.interceptor.request)}]`);
        }

        api.interceptor.request.forEach((interceptor, index) => {
            const interceptorMiddleware = this.middlewareLoader.loadMiddleware('interceptor/request', interceptor.middleware);
            if (interceptor.group) {
                const groupValidator = Groups.buildGroupAllowFilter(api.group, interceptor.group);
                apiRouter.use((req, res, next) => {
                    if (groupValidator(req, res)) {
                        const proxyReq = (<any>req).proxyReq || {
                            body: req.body,
                            headers: Object.assign({}, req.headers),
                            method: req.method,
                            url: req.url,
                            user: req.user
                        };
                        Promise.resolve(interceptorMiddleware(proxyReq))
                            .then(result => {
                                (<any>req).proxyReq = Object.assign(proxyReq, result || {});
                                next();
                            }).catch(err => {
                                next(err);
                            });
                    } else {
                        next();
                    }
                });
            } else {
                apiRouter.use((req, res, next) => {
                    const proxyReq = (<any>req).proxyReq || {
                        body: req.body,
                        headers: Object.assign({}, req.headers),
                        method: req.method,
                        url: req.url,
                        user: req.user
                    };
                    Promise.resolve(interceptorMiddleware(proxyReq))
                        .then(result => {
                            (<any>req).proxyReq = Object.assign(proxyReq, result || {});
                            next();
                        }).catch(err => {
                            next(err);
                        });
                });
            }
        });
    }

    private buildResponseInterceptor(api: ApiConfig) {
        const body = new Array<string>();
        const interceptors: any = {};
        const result: ResponseInterceptors = {
            middelware: null,
            validators: []
        };
        body.push(`var continueChain = function(body, headers, request){ return {body: body}; };`);
        api.interceptor.response.forEach((interceptor, index) => {
            const interceptorMiddleware = this.middlewareLoader.loadMiddleware('interceptor/response', interceptor.middleware);
            const middlewareId = this.middlewareLoader.getId(interceptor.middleware);
            interceptors[middlewareId] = interceptorMiddleware;
            if (interceptor.group) {
                result.validators.push(Groups.buildGroupNotAllowFilter(api.group, interceptor.group));
            } else {
                result.validators.push((req: any) => false);
            }
            body.push(`var f${index};`);
            body.push(`if (ignore[${index}])`);
            body.push(`f${index} = continueChain;`);
            body.push(`else f${index} = interceptors['${middlewareId}'];`);
            body.push(`Promise.resolve(f${index}(body, proxyRes.headers, request)).catch((error) => { \
                   callback(error); \
                   return; \
                }).then(result => { \
                    body = result.body; \
                    headersHandler(result.updateHeaders, result.removeHeaders);`
            );
        });
        api.interceptor.response.forEach((interceptor, index) => {
            if (index === 0) {
                body.push(`callback(null, body);`);
            }
            body.push(`});`);
        });
        result.middelware = createFunction({
            interceptors: interceptors,
            mm: mm
        }, 'body', 'proxyRes', 'request', 'response', 'ignore', 'headersHandler', 'callback', body.join(''));
        return result;
    }
}
