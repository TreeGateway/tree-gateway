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
            'basic': '../authentication/strategies/basic',
            'jwt': '../authentication/strategies/jwt',
            'local': '../authentication/strategies/local'
        },
        'errorhandler': {
            'json': '../error/handlers/json',
            'mustache': '../error/handlers/mustache'
        },
        'filter': {
            'ipFilter': '../filter/filters/ipFilter'
        },
        'interceptor/request': {
            'requestBodyTransformer': '../proxy/interceptors/requestBodyTransformer',
            'requestHeaders': '../proxy/interceptors/requestHeaders',
            'requestMustache': '../proxy/interceptors/requestMustache',
            'requestXml': '../proxy/interceptors/requestXml'
        },
        'interceptor/response': {
            'responseBodyTransformer': '../proxy/interceptors/responseBodyTransformer',
            'responseHeaders': '../proxy/interceptors/responseHeaders',
            'responseMustache': '../proxy/interceptors/responseMustache',
            'responseXml': '../proxy/interceptors/responseXml',
            'webSecurity': '../proxy/interceptors/webSecurity'
        },
        'proxy/router': {
            'header': '../proxy/routers/header',
            'loadBalancer': '../proxy/routers/loadBalancer',
            'query': '../proxy/routers/query',
            'trafficSplit': '../proxy/routers/trafficSplit'
        },
        'request/logger': {
            'redis': '../stats/request-logger/redis'
        },
        'servicediscovery': {
            'consul': '../servicediscovery/middleware/consul'
        },
        'servicediscovery/provider': {
            'consul': '../servicediscovery/middleware/provider/consul'
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

        let middleware = require(p);
        if (middleware.factory) {
            middleware = middleware(middlewareConfig.options || {});
        }
        return middleware;
    }

    getId(middlewareConfig: MiddlewareConfig) {
        return middlewareConfig.id || middlewareConfig.name;
    }
}
