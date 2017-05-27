'use strict';

import * as express from 'express';
import { ApiConfig } from '../config/api';
import { Proxy, HttpAgent } from '../config/proxy';
import { ProxyFilter } from './filter';
import { ProxyInterceptor } from './interceptor';
import { Logger } from '../logger';
import { AutoWired, Inject } from 'typescript-ioc';
import {getMilisecondsInterval} from '../utils/time-intervals';
import * as url from 'url';
import * as _ from 'lodash';
import * as getRawBody from 'raw-body';
const agentKeepAlive = require('agentkeepalive');
const httpProxy = require('../../lib/http-proxy');
const memoryStream = require('memory-streams').WritableStream;

/**
 * The API Proxy system. It uses [[http-proxy]](https://github.com/nodejitsu/node-http-proxy)
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
        if (api.proxy.parseReqBody) {
            apiRouter.use(this.configureBodyParser(api));
        }
        apiRouter.use(this.configureProxy(api));
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
        const proxyTarget = url.parse(api.proxy.target.host);
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

        if (proxyTarget.protocol && proxyTarget.protocol === 'https:') {
            return new agentKeepAlive.HttpsAgent(agentOptions);
        }
        return new agentKeepAlive(agentOptions);
    }

    private configureBodyParser(api: ApiConfig) {
        const limit = api.proxy.limit || '1mb';
        return (req: express.Request, res: express.Response, next: express.NextFunction) => {
            this.maybeParseBody(req, limit)
                .then(buf => {
                    req.body = buf;
                    next();
                })
                .catch(err => next(err));
        };
    }

    private configureProxy(api: ApiConfig) {
        const self = this;
        const apiProxy: Proxy = api.proxy;
        const proxyConfig: any = {
            changeOrigin: !apiProxy.preserveHostHdr,
            target: apiProxy.target.host
        };
        const httpAgent = self.getHttpAgent(api);
        if (httpAgent) {
            proxyConfig.agent = httpAgent;
        }
        if (apiProxy.timeout) {
            proxyConfig.proxyTimeout = getMilisecondsInterval(apiProxy.timeout);
        }

        const shouldWrapResponse = api.proxy.parseResBody && this.interceptor.hasResponseInterceptor(api.proxy);
        proxyConfig.delayHeaders = shouldWrapResponse;
        const proxy = httpProxy.createProxyServer(proxyConfig);

        const filter: (req: express.Request, res: express.Response) => boolean = this.getFilterMiddleware(api);
        this.handleRequestInterceptor(api, proxy);
        this.handleResponseInterceptor(api, proxy);

        return (req: express.Request, res: express.Response, next: express.NextFunction) => {
            if (shouldWrapResponse) {
                (<any>res).__write = res.write;
                (<any>res).__data = new memoryStream();
                res.write = (data: any, encoding?: any, cb?: any) => {
                    return (<any>res).__data.write(data, encoding, cb);
                };
            }

            if (filter(req, res)) {
                proxy.web(req, res);
            } else {
                next();
            }
        };
    }

    private handleResponseInterceptor(api: ApiConfig, proxy: any) {
        const responseInterceptor: Function = this.interceptor.responseInterceptor(api);
        if (responseInterceptor) {
            if (api.proxy.parseResBody) {
                proxy.on('end', (req: any, res: any, proxyRes: any, ) => {
                    responseInterceptor(res.__data.toBuffer(), proxyRes, req, res,
                        (newHeaders: any) => {
                            if (newHeaders) {
                                Object.keys(newHeaders).forEach(name => {
                                    proxyRes.headers[name.toLowerCase()] = newHeaders[name];
                                    res.set(name.toLowerCase(), newHeaders[name]);
                                });
                            }
                        },
                        (err: any, body: any) => {
                            if (err) {
                                this.logger.error();
                            }
                            res.write = res.__write;
                            delete res['__write'];
                            delete res['__data'];
                            res.send(body);
                        });
                });
            } else {
                proxy.on('proxyRes', (proxyRes: any, req: any, res: any) => {
                    responseInterceptor(null, proxyRes, req, res,
                        (newHeaders: any) => {
                            if (newHeaders) {
                                Object.keys(newHeaders).forEach(name => {
                                    proxyRes.headers[name.toLowerCase()] = newHeaders[name];
                                });
                            }
                        },
                        (err: any, body: any) => {
                            if (err) {
                                this.logger.error();
                            }
                            // ignore body when parseResBody is false.
                        });
                });
            }
        }
    }

    private handleRequestInterceptor(api: ApiConfig, proxy: any) {
        const requestInterceptor: Function = this.interceptor.requestInterceptor(api);
        const parseReqBody = api.proxy.parseReqBody;
        if (requestInterceptor) {
            proxy.on('proxyReq', (proxyReq: any, userReq: any, response: any, options: any) => {
                requestInterceptor(proxyReq, userReq);
                if (parseReqBody) {
                    this.updateBody(proxyReq, userReq);
                }
            });
        } else if (parseReqBody) {
            proxy.on('proxyReq', (proxyReq: any, userReq: any, response: any, options: any) => {
                this.updateBody(proxyReq, userReq);
            });
        }
    }

    private updateBody(proxyReq: any, userReq: any) {
        let body = proxyReq.body || userReq.body;
        if (body) {
            body = this.asBuffer(body);
            proxyReq.setHeader('Content-Length', (<Buffer>body).length);
            proxyReq.write(body);
        }
    }

    private asBuffer(body: any) {
        let ret;
        if (Buffer.isBuffer(body)) {
            ret = body;
        } else if (typeof body === 'object') {
            ret = new Buffer(JSON.stringify(body));
        } else if (typeof body === 'string') {
            ret = new Buffer(body);
        }
        return ret;
    }

    private getFilterMiddleware(api: ApiConfig): (req: express.Request, res: express.Response) => boolean {
        const self = this;
        const filterChain: Array<Function> = this.filter.buildFilters(api);
        const debug = this.logger.isDebugEnabled();
        if (filterChain && filterChain.length > 0) {
            return (req: express.Request, res: express.Response) => {
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
        }
        return (req: express.Request, res: express.Response) => true;
    }

    private maybeParseBody(req: express.Request, limit: string) {
        if (req.body) {
            return Promise.resolve(req.body);
        } else {
            return getRawBody(req, {
                length: req.headers['content-length'],
                limit: limit
            });
        }
    }
}
