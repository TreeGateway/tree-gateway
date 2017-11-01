'use strict';

import * as express from 'express';
import { JSONAtaExpression, validateJsonAtaExpression } from '../../config/proxy';
import { Logger } from '../../logger';
import { Container } from 'typescript-ioc';

const jsonata = require('jsonata');
module.exports = function(config: JSONAtaExpression) {
    validateJsonAtaExpression(config);
    const logger: Logger = Container.get(Logger);
    const expression = jsonata(config.expression);
    return (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (err && err.message) {
            if (res.headersSent) { // important to allow default error handler to close connection if headers already sent
                return next(err);
            }
            res.set('Content-Type', 'application/json');
            res.status(err.statusCode || err.status || 500);

            let body;
            try {
                body = expression.evaluate({
                    error: err,
                    req: req,
                    res: res
                });
            } catch (e) {
                body = { error: err.message };
            }
            res.json(body);
            if (logger.isWarnEnabled()) {
                logger.warn(`Error on API pipeline processing: ${err.message}`);
            }
        } else {
            next(err);
        }
    };
};
