'use strict';

import * as mustache from 'mustache';
import * as Joi from 'joi';
import { ValidationError } from '../../error/errors';

interface MustacheConfig {
    template: string;
}

const mustacheConfigSchema = Joi.object().keys({
    template: Joi.string().required(),
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
    return (req: any) => {
        const result: any = {};
        try {
            let body = req.body;
            if (req.body && (typeof req.body === 'string') || Buffer.isBuffer(req.body)) {
                body = JSON.parse(req.body.toString());
            }
            result.body = mustache.render(template, body || {});
        } catch (e) {
            result.body = '';
        }
        return result;
    };
};
