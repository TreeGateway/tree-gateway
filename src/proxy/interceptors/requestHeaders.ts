'use strict';

import * as Joi from 'joi';
import * as _ from 'lodash';
import { ValidationError } from '../../error/errors';

interface RequestHeadersConfig {
    headers?: any;
    updateHeaders?: any;
    removeHeaders?: Array<string>;
}

const requestHeadersSchema = Joi.object().keys({
    headers: Joi.object().unknown(true),
    removeHeaders: Joi.array().items(Joi.string()),
    updateHeaders: Joi.object().unknown(true)
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
    if (config.removeHeaders) {
        config.removeHeaders = config.removeHeaders.map(header => header.toLowerCase());
    }
    const updateHeaders = config.updateHeaders || config.headers;
return (req: any) => {
        let h = req.headers;
        if (updateHeaders) {
            h = Object.assign(h, updateHeaders);
        }
        if (config.removeHeaders) {
            h = _.omit(h, ...config.removeHeaders);
        }
        return { headers: h };
    };
};
