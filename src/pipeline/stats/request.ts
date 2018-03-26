'use strict';

import { Configuration } from '../../configuration';
import { Request } from 'express';
import { Singleton, AutoWired, Inject } from 'typescript-ioc';
import { ApiConfig } from '../../config/api';
import { MiddlewareLoader } from '../../utils/middleware-loader';
import { normalizePath } from '../../utils/path';

export interface RequestLog {
    authentication?: string;
    apiId: string;
    body?: any;
    cache?: string;
    circuitbreaker?: string;
    error?: string;
    headers?: { [index: string]: {header: string} };
    ip: string;
    method: string;
    path: string;
    proxyTime: number;
    responseTime: number;
    status: number;
    timestamp: number;
    throttling?: string;
}

@AutoWired
@Singleton
export class RequestLogger {
    @Inject private config: Configuration;
    @Inject private middlewareLoader: MiddlewareLoader;

    private requestLogHandler: (requestLog: RequestLog) => void;

    initialize() {
        this.requestLogHandler = this.middlewareLoader.loadMiddleware('request/logger',
            this.getRequestLogMiddleware());
    }

    isRequestLogEnabled(api: ApiConfig): boolean {
        return (this.isGatewayRequestLogEnabled() && !api.disableAnalytics);
    }

    isGatewayRequestLogEnabled() {
        return this.config.gateway.analytics && this.config.gateway.analytics.enabled;
    }

    getRequestLog(req: Request): RequestLog {
        return (<any>req).requestLog;
    }

    initRequestLog(req: Request, api: ApiConfig): RequestLog {
        (<any>req).requestLog = {
            apiId: api.id,
            ip: req.ip,
            method: req.method,
            path: normalizePath(req.path),
            timestamp: new Date().getTime()
        };
        return (<any>req).requestLog;
    }

    registerOccurrence(requestLog: RequestLog) {
        this.requestLogHandler(requestLog);
    }

    private getRequestLogMiddleware() {
        if (this.config.gateway.analytics && this.config.gateway.analytics.logger) {
            return this.config.gateway.analytics.logger;
        }
        return {
            name: 'redis',
            options: {
                maxEntries: 10000
            }
        };
    }
}
