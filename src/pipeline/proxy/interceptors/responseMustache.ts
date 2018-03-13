'use strict';

import * as mustache from 'mustache';
import * as Joi from 'joi';
import { ValidationError } from '../../../config/errors';

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
    return (body: any, headers: any, request: any) => {
        const result: any = {};
        try {
            if (body && (typeof body === 'string') || Buffer.isBuffer(body)) {
                body = JSON.parse(body.toString());
            }
            result.body = mustache.render(template, body || {});
        } catch (e) {
            result.body = '';
        }
        return result;
    };
};
module.exports.factory = true;
