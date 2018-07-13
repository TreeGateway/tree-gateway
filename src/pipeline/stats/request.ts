'use strict';

import { Request } from 'express';
import { AutoWired, Inject, Singleton } from 'typescript-ioc';
import { ApiConfig } from '../../config/api';
import { Configuration } from '../../configuration';
import { MiddlewareLoader } from '../../utils/middleware-loader';
import { normalizePath } from '../../utils/path';

export interface RequestLog {
    authentication?: string;
    apiId: string;
    body?: any;
    cache?: string;
    circuitbreaker?: string;
    error?: string;
    headers?: { [index: string]: { header: string } };
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

    public initialize() {
        this.requestLogHandler = this.middlewareLoader.loadMiddleware('request/logger',
            this.getRequestLogMiddleware());
    }

    public isRequestLogEnabled(api: ApiConfig): boolean {
        return (this.isGatewayRequestLogEnabled() && !api.disableAnalytics);
    }

    public isGatewayRequestLogEnabled() {
        return this.config.gateway.analytics && this.config.gateway.analytics.enabled;
    }

    public getRequestLog(req: Request): RequestLog {
        return (req as any).requestLog;
    }

    public initRequestLog(req: Request, api: ApiConfig): RequestLog {
        (req as any).requestLog = {
            apiId: api.id,
            ip: req.ip,
            method: req.method,
            path: normalizePath(req.path),
            timestamp: new Date().getTime()
        };
        return (req as any).requestLog;
    }

    public registerOccurrence(requestLog: RequestLog) {
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
