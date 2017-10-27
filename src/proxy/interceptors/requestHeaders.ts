'use strict';

import * as Joi from 'joi';
import * as _ from 'lodash';
import { ValidationError } from '../../error/errors';

interface RequestHeadersConfig {
    headers?: any;
    removeHeaders?: Array<string>;
}

const requestHeadersSchema = Joi.object().keys({
    headers: Joi.object().unknown(true),
    removeHeaders: Joi.array().items(Joi.string())
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
return (req: any) => {
        let h = req.headers;
        if (config.headers) {
            h = Object.assign(h, config.headers);
        }
        if (config.removeHeaders) {
            h = _.omit(h, ...config.removeHeaders);
        }
        // tslint:disable-next-line:no-console
        console.log({ headers: h });
        return { headers: h };
    };
};
