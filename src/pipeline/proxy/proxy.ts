'use strict';

import * as express from 'express';
import { ApiConfig } from '../../config/api';
import { Proxy, HttpAgent, ProxyRouter } from '../../config/proxy';
import { ProxyInterceptor, ResponseInterceptors } from './interceptor';
import { Logger } from '../../logger';
import { AutoWired, Inject } from 'typescript-ioc';
import { getMilisecondsInterval } from '../../utils/time-intervals';
import * as url from 'url';
import * as _ from 'lodash';
import { MiddlewareLoader } from '../../utils/middleware-loader';
import { ServiceDiscovery } from '../servicediscovery/service-discovery';
import { WritableStreamBuffer } from 'stream-buffers';
import { ApiPipelineConfig } from '../../config/gateway';
const agentKeepAlive = require('agentkeepalive');
const httpProxy = require('../../../lib/http-proxy');

/**
 * The API Proxy system. It uses [[http-proxy]](https://github.com/nodejitsu/node-http-proxy)
 * to proxy requests to a target API.
 */
@AutoWired
export class ApiProxy {
    @Inject private interceptor: ProxyInterceptor;
    @Inject private logger: Logger;
    @Inject private middlewareLoader: MiddlewareLoader;
    @Inject private serviceDiscovery: ServiceDiscovery;

    /**
     * Configure a proxy for a given API
     */
    proxy(apiRouter: express.Router, api: ApiConfig, pipelineConfig: ApiPipelineConfig) {
        this.buildRouterMiddleware(apiRouter, api);
        this.buildServiceDiscoveryMiddleware(apiRouter, api);
        this.interceptor.buildRequestInterceptors(apiRouter, api, pipelineConfig);
        apiRouter.use(this.configureProxy(api, pipelineConfig));
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

    private getHttpAgent(api: ApiConfig) {
        const apiAgentOptions: HttpAgent = api.proxy.httpAgent || {};
        const agentOptions: any = {
            keepAlive: true
        };
        if (_.isBoolean(apiAgentOptions.keepAlive) && !apiAgentOptions.keepAlive) {
            agentOptions.keepAlive = false;
        }
        if (agentOptions.keepAlive) {
            agentOptions.keepAliveMsecs = getMilisecondsInterval(apiAgentOptions.keepAliveTime, 1000);
            agentOptions.freeSocketKeepAliveTimeout = getMilisecondsInterval(apiAgentOptions.freeSocketKeepAliveTimeout, 15000);
            agentOptions.maxFreeSockets = apiAgentOptions.maxFreeSockets || 256;
        }
        if (apiAgentOptions.maxSockets) {
            agentOptions.maxSockets = apiAgentOptions.maxSockets;
        }
        if (apiAgentOptions.timeout) {
            agentOptions.timeout = getMilisecondsInterval(apiAgentOptions.timeout);
        }
        if (api.proxy.target.router) {
            if (api.proxy.target.router.ssl) {
                return new agentKeepAlive.HttpsAgent(agentOptions);
            }
        } else {
            const proxyTarget = url.parse(api.proxy.target.host);
            if (proxyTarget.protocol && proxyTarget.protocol === 'https:') {
                return new agentKeepAlive.HttpsAgent(agentOptions);
            }
        }
        return new agentKeepAlive(agentOptions);
    }

    private configureProxy(api: ApiConfig, pipelineConfig: ApiPipelineConfig) {
        const apiProxy: Proxy = api.proxy;
        const proxyConfig: any = {
            changeOrigin: !apiProxy.preserveHostHdr,
            target: apiProxy.target.host
        };
        const httpAgent = this.getHttpAgent(api);
        if (httpAgent) {
            proxyConfig.agent = httpAgent;
        }
        if (apiProxy.timeout) {
            proxyConfig.proxyTimeout = getMilisecondsInterval(apiProxy.timeout);
        }

        const proxy = httpProxy.createProxyServer(proxyConfig);
        proxy.on('error', (err: any, req: express.Request, res: express.Response) => {
            const hostname = (req.headers && req.headers.host) || (req.hostname || req.host);     // (websocket) || (node0.10 || node 4/5)
            const target = apiProxy.target.host;
            const errReference = 'https://nodejs.org/api/errors.html#errors_common_system_errors'; // link to Node Common Systems Errors page

            this.logger.error('[Tree-Gateway] Error occurred while trying to proxy request %s from %s to %s (%s) (%s)', req.url, hostname, target, err.code, errReference);
            if (!res.headersSent) {
                res.status(502).send('Bad Gateway');
            }
        });

        const maybeWrapResponse = this.interceptor.hasResponseInterceptor(api);
        const responseInterceptor: ResponseInterceptors = this.interceptor.buildResponseInterceptors(api, pipelineConfig);
        this.handleResponseInterceptor(api, proxy, responseInterceptor);

        function validateInterceptors(req: express.Request, res: express.Response): boolean {
            if (responseInterceptor) {
                let ignoreAll = true;
                (<any>res).__ignore = new Array<boolean>();
                responseInterceptor.validators.forEach((validator, index) => {
                    const ignore = validator(req);
                    (<any>res).__ignore.push(ignore);
                    ignoreAll = ignoreAll && ignore;
                });
                return maybeWrapResponse && !ignoreAll;
            }
            return false;
        }

        return (req: express.Request, res: express.Response, next: express.NextFunction) => {
            if (validateInterceptors(req, res) || (<any>req).parseRespBody) {
                const options: any = (<any>req).proxyOptions || {};
                (<any>res).__data = new WritableStreamBuffer();
                options.destPipe = { stream: (<any>res).__data };
                proxy.web(req, res, options);
            } else if ((<any>req).proxyOptions) {
                proxy.web(req, res, (<any>req).proxyOptions);
            } else {
                proxy.web(req, res);
            }
        };
    }

    private handleResponseInterceptor(api: ApiConfig, proxy: any, responseInterceptor: ResponseInterceptors) {
        proxy.on('end', (req: any, res: any, proxyRes: any, ) => {
            if (res.__data) {
                if (responseInterceptor) {
                    responseInterceptor.middelware(res.__data.getContents(), proxyRes, req, res, res.__ignore,
                        (newHeaders: any, removeHeaders: string[]) => {
                            if (newHeaders) {
                                Object.keys(newHeaders).forEach(name => {
                                    proxyRes.headers[name.toLowerCase()] = newHeaders[name];
                                    res.set(name.toLowerCase(), newHeaders[name]);
                                });
                            }
                            if (removeHeaders) {
                                removeHeaders.forEach(name => {
                                    delete proxyRes.headers[name];
                                    res.removeHeader(name);
                                    if (name !== name.toLowerCase()) {
                                        delete proxyRes.headers[name.toLowerCase()];
                                        res.removeHeader(name.toLowerCase());
                                    }
                                });
                            }
                        },
                        (err: any, body: any) => {
                            if (err) {
                                this.logger.error(err);
                            }
                            delete res['__data'];
                            if (!res.finished) {
                                res.send(body);
                            }
                        });
                } else {
                    const body = res.__data.getContents();
                    delete res['__data'];
                    if (!res.finished) {
                        res.send(body);
                    }
                }
            }
        });
    }

    private buildRouterMiddleware(apiRouter: express.Router, api: ApiConfig) {
        if (api.proxy.target.router) {
            const router: ProxyRouter = api.proxy.target.router;
            if (api.proxy.target.router.middleware) {
                const routerMiddleware = this.middlewareLoader.loadMiddleware('proxy/router', router.middleware);
                apiRouter.use((req, res, next) => {
                    Promise.resolve(routerMiddleware(req))
                        .then(result => {
                            (<any>req).proxyOptions = { target: result };
                            next();
                        }).catch(err => {
                            next(err);
                        });
                });
            }
        }
    }

    private buildServiceDiscoveryMiddleware(apiRouter: express.Router, api: ApiConfig) {
        const router: ProxyRouter = api.proxy.target.router;
        if (router) {
            if (router.serviceDiscovery) {
                const serviceDiscovery = this.serviceDiscovery.loadServiceDiscovery(router.serviceDiscovery, router.ssl);
                apiRouter.use((req, res, next) => {
                    Promise.resolve(serviceDiscovery((<any>req).proxyOptions ? (<any>req).proxyOptions.target : null))
                        .then(result => {
                            (<any>req).proxyOptions = { target: result };
                            next();
                        }).catch(err => {
                            next(err);
                        });
                });
            }
        }
    }
}
