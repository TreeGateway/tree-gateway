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
        'filter': {
            'ipFilter': '../filter/filters/ipFilter'
        },
        'interceptor/request': {
            'requestBodyTransformer': '../proxy/interceptors/requestBodyTransformer'
        },
        'interceptor/response': {
            'responseBodyTransformer': '../proxy/interceptors/responseBodyTransformer'
        },
        'proxy/router': {
            'header': '../proxy/routers/header',
            'loadBalancer': '../proxy/routers/loadBalancer',
            'query': '../proxy/routers/query',
            'trafficSplit': '../proxy/routers/trafficSplit'
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
        if ((_.has(MiddlewareLoader.providedMiddlewares, type)) &&
            (_.has(MiddlewareLoader.providedMiddlewares[type], middlewareConfig.name))) {
            p = MiddlewareLoader.providedMiddlewares[type][middlewareConfig.name];
        } else {
            p = path.join(this.config.middlewarePath, type, middlewareConfig.name);
        }

        let middleware = require(p);
        if (middlewareConfig.options) {
            middleware = middleware(middlewareConfig.options);
        }
        return middleware;
    }
}
