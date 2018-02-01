'use strict';

import * as Joi from 'joi';
import * as _ from 'lodash';
import { ValidationError } from '../../error/errors';

interface ResponseHeadersConfig {
    headers?: any;
    removeHeaders?: Array<string> | string;
    updateHeaders?: any;
}

const responseHeadersSchema = Joi.object().keys({
    headers: Joi.object().unknown(true),
    removeHeaders: Joi.alternatives([Joi.array().items(Joi.string()), Joi.string()]),
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
    config.removeHeaders = _.castArray(config.removeHeaders);
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
