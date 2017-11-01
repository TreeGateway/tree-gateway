'use strict';

import * as Joi from 'joi';
import { ValidationError } from '../../error/errors';

interface ResponseHeadersConfig {
    headers?: any;
    removeHeaders?: Array<string>;
    updateHeaders?: any;
}

const responseHeadersSchema = Joi.object().keys({
    headers: Joi.object().unknown(true),
    removeHeaders: Joi.array().items(Joi.string()),
    updateHeaders: Joi.object().unknown(true)
});

function validateResponseHeadersConfig(config: ResponseHeadersConfig) {
    const result = Joi.validate(config, responseHeadersSchema);
    if (result.error) {
        throw new ValidationError(result.error);
    } else {
        return result.value;
    }
}

module.exports = function(config: ResponseHeadersConfig) {
    validateResponseHeadersConfig(config);
    const updateHeaders = config.updateHeaders || config.headers;
    return (body: any, headers: any, request: any) => {
        const result: any = { body: body };
        if (config.removeHeaders && config.removeHeaders.length) {
            result.removeHeaders = config.removeHeaders;
        }
        if (updateHeaders) {
            result.updateHeaders = updateHeaders;
        }
        return result;
    };
};
