'use strict';

import * as express from 'express';
import { Logger } from '../../logger';
import { Container } from 'typescript-ioc';
import * as mustache from 'mustache';
import * as Joi from 'joi';
import { ValidationError } from '../../error/errors';

interface MustacheConfig {
    template: string;
    contentType?: string;
}

const mustacheConfigSchema = Joi.object().keys({
    contentType: Joi.string(),
    template: Joi.string().required()
});

function validateMustacheConfig(config: MustacheConfig) {
    const result = Joi.validate(config, mustacheConfigSchema);
    if (result.error) {
        throw new ValidationError(result.error);
    } else {
        return result.value;
    }
}

module.exports = function(config: MustacheConfig) {
    validateMustacheConfig(config);
    const template = config.template;
    const logger: Logger = Container.get(Logger);
    return (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (err && err.message) {
            if (res.headersSent) { // important to allow default error handler to close connection if headers already sent
                return next(err);
            }
            res.set('Content-Type', config.contentType || 'text/html');
            res.status(err.statusCode || err.status || 500);

            let body;
            try {
                body = mustache.render(template, {
                    error: err,
                    req: req,
                    res: res
                });
            } catch (e) {
                body = { error: err.message };
            }
            res.send(body);
            if (logger.isWarnEnabled()) {
                logger.warn(`Error on API pipeline processing: ${err.message}`);
            }
        } else {
            next(err);
        }
    };
};
