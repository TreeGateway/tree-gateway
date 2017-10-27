'use strict';

import * as Joi from 'joi';
import { ValidationError } from '../../error/errors';

interface RequestHeadersConfig {
    headers: any;
}

const requestHeadersSchema = Joi.object().keys({
    headers: Joi.object().unknown(true)
});

function validateRequestHeadersConfig(config: RequestHeadersConfig) {
    const result = Joi.validate(config, requestHeadersSchema);
    if (result.error) {
        throw new ValidationError(result.error);
    } else {
        return result.value;
    }
}

module.exports = function(config: RequestHeadersConfig) {
    validateRequestHeadersConfig(config);
    const headers = config.headers;
    return (req: any) => {
        const h = Object.assign(req.headers, headers);
        return { headers: h };
    };
};
