'use strict';

import * as _ from 'lodash';
import * as path from 'path';
import { MiddlewareConfig } from '../config/middleware';
import { Configuration } from '../configuration';
import { AutoWired, Singleton, Inject } from 'typescript-ioc';

@AutoWired
@Singleton
export class MiddlewareLoader {
    private static providedMiddlewares: any = {
        'authentication/strategy': {
            'basic': '../pipeline/authentication/strategies/basic',
            'jwt': '../pipeline/authentication/strategies/jwt',
            'local': '../pipeline/authentication/strategies/local'
        },
        'errorhandler': {
            'json': '../pipeline/error/handlers/json',
            'mustache': '../pipeline/error/handlers/mustache'
        },
        'filter': {
            'ipFilter': '../pipeline/filter/filters/ipFilter'
        },
        'interceptor/request': {
            'requestBodyTransformer': '../pipeline/proxy/interceptors/requestBodyTransformer',
            'requestHeaders': '../pipeline/proxy/interceptors/requestHeaders',
            'requestMustache': '../pipeline/proxy/interceptors/requestMustache',
            'requestXml': '../pipeline/proxy/interceptors/requestXml'
        },
        'interceptor/response': {
            'responseBodyTransformer': '../pipeline/proxy/interceptors/responseBodyTransformer',
            'responseHeaders': '../pipeline/proxy/interceptors/responseHeaders',
            'responseMustache': '../pipeline/proxy/interceptors/responseMustache',
            'responseXml': '../pipeline/proxy/interceptors/responseXml',
            'webSecurity': '../pipeline/proxy/interceptors/webSecurity'
        },
        'proxy/router': {
            'header': '../pipeline/proxy/routers/header',
            'loadBalancer': '../pipeline/proxy/routers/loadBalancer',
            'query': '../pipeline/proxy/routers/query',
            'trafficSplit': '../pipeline/proxy/routers/trafficSplit'
        },
        'request/logger': {
            'redis': '../pipeline/stats/request-logger/redis'
        },
        'servicediscovery': {
            'consul': '../pipeline/servicediscovery/middleware/consul'
        },
        'servicediscovery/provider': {
            'consul': '../pipeline/servicediscovery/middleware/provider/consul'
        }
    };

    @Inject private config: Configuration;

    loadMiddleware(type: string, middlewareConfig: MiddlewareConfig) {
        let p: string;
        const middlewareId = this.getId(middlewareConfig);
        if ((_.has(MiddlewareLoader.providedMiddlewares, type)) &&
            (_.has(MiddlewareLoader.providedMiddlewares[type], middlewareId))) {
            p = MiddlewareLoader.providedMiddlewares[type][middlewareId];
        } else {
            p = path.join(this.config.middlewarePath, type, middlewareId);
        }

        let middleware;
        try {
            middleware = require(p);
        } catch(e) {
            middleware = require(middlewareId);
        }
        if (middleware.factory) {
            middleware = middleware(middlewareConfig.options || {});
        }
        return middleware;
    }

    getId(middlewareConfig: MiddlewareConfig) {
        return middlewareConfig.id || middlewareConfig.name;
    }
}
