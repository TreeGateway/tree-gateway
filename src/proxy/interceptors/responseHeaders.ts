'use strict';

import * as Joi from 'joi';
import { ValidationError } from '../../error/errors';

interface ResponseHeadersConfig {
    removeHeaders?: Array<string>;
    updateHeaders?: any;
}

const responseHeadersSchema = Joi.object().keys({
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
    return (req: any) => {
        const result: any = {};
        if (config.removeHeaders && config.removeHeaders.length) {
            result.removeHeaders = config.removeHeaders;
        }
        if (config.updateHeaders) {
            result.updateHeaders = config.updateHeaders;
        }
        return result;
    };
};
