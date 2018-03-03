'use strict';

import * as express from 'express';
import { ApiConfig } from '../config/api';
import { Logger } from '../logger';
import { AutoWired, Inject } from 'typescript-ioc';
import { MiddlewareLoader } from '../utils/middleware-loader';
import { Configuration } from '../configuration';
import { MiddlewareConfig } from '../config/middleware';
import { RequestLogger } from '../stats/request';

/**
 * The API Error handler. Called to handle errors in API pipeline processing.
 */
@AutoWired
export class ApiErrorHandler {
    @Inject private config: Configuration;
    @Inject private logger: Logger;
    @Inject private middlewareLoader: MiddlewareLoader;
    @Inject private requestLogger: RequestLogger;

    /**
     * Configure a proxy for a given API
     */
    handle(apiRouter: express.Router, api: ApiConfig) {
        apiRouter.use(this.configureErrorHandler(api));
    }

    private configureErrorHandler(api: ApiConfig) {
        const errorHandler: MiddlewareConfig = api.errorHandler || this.config.gateway.errorHandler;
        const appErrorHandler = this.getAppErrorHandler(errorHandler);
        if (this.requestLogger.isRequestLogEnabled(api)) {
            return (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
                if (err && err.message) {
                    const requestLog = this.requestLogger.getRequestLog(req);
                    if (requestLog) {
                        requestLog.error = err.message;
                    }
                }
                appErrorHandler(err, req, res, next);
            };
        } else {
            return appErrorHandler;
        }
    }

    private getAppErrorHandler(errorHandler: MiddlewareConfig) {
        if (errorHandler) {
            return this.middlewareLoader.loadMiddleware('errorhandler', errorHandler);
        } else {
            return (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
                if (err && err.message) {
                    if (res.headersSent) { // important to allow default error handler to close connection if headers already sent
                        return next(err);
                    }
                    const mime = req.accepts('json', 'xml', 'html', 'text');
                    res.status(err.statusCode || err.status || 500);
                    switch (mime) {
                        case 'json':
                            res.set('Content-Type', 'application/json');
                            res.json({ error: err.message });
                            break;
                        case 'xml':
                            res.set('Content-Type', 'application/xml');
                            res.send(`<error>${err.message}</error>`);
                            break;
                        case 'html':
                            res.set('Content-Type', 'text/html');
                            res.send(`<html><head></head><body>${err.message}</body></html>`);
                            break;
                        default:
                            res.set('Content-Type', 'text/plain');
                            res.send(err.message);
                    }
                    if (this.logger.isWarnEnabled()) {
                        this.logger.warn(`Error on API pipeline processing: ${err.message}`);
                        this.logger.warn(err);
                    }
                } else {
                    next(err);
                }
            };
        }
    }
}
