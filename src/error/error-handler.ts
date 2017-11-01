'use strict';

import * as express from 'express';
import { ApiConfig } from '../config/api';
import { Logger } from '../logger';
import { AutoWired, Inject } from 'typescript-ioc';
import { MiddlewareLoader } from '../utils/middleware-loader';
import { Configuration } from '../configuration';
import { MiddlewareConfig } from '../config/middleware';

/**
 * The API Error handler. Called to handle errors in API pipeline processing.
 */
@AutoWired
export class ApiErrorHandler {
    @Inject private config: Configuration;
    @Inject private logger: Logger;
    @Inject private middlewareLoader: MiddlewareLoader;

    /**
     * Configure a proxy for a given API
     */
    handle(apiRouter: express.Router, api: ApiConfig) {
        apiRouter.use(this.configureErrorHandler(api.errorHandler || this.config.gateway.errorHandler));
    }

    private configureErrorHandler(errorHandler: MiddlewareConfig) {
        if (errorHandler) {
            return this.middlewareLoader.loadMiddleware('errorhandler', errorHandler);
        } else {
            return (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
                if (err && err.message) {
                    if (res.headersSent) { // important to allow default error handler to close connection if headers already sent
                        return next(err);
                    }
                    res.set('Content-Type', 'application/json');
                    res.status(err.statusCode || err.status || 500);
                    res.json({ error: err.message });
                    if (this.logger.isWarnEnabled()) {
                        this.logger.warn(`Error on API pipeline processing: ${err.message}`);
                    }
                } else {
                    next(err);
                }
            };
        }
    }
}
