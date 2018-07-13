'use strict';

import * as Joi from 'joi';
import * as _ from 'lodash';
import { ValidationError } from '../../../config/errors';

const responseHeaders = require('./responseHeaders');

interface FilterConfig {
    /**
     * to keep clients from sniffing the MIME type
     */
    noSniff: boolean;
    /**
     * enable browser DNS prefetching
     */
    dnsPrefetchControl: boolean;
    /**
     * to prevent clickjacking
     */
    frameguard: 'DENY' | 'ALLOW-FROM' | 'SAMEORIGIN';
    /**
     * Allowed domains for fames
     */
    frameguardDomain: string;
    /**
     * adds some small XSS protections
     */
    xssFilter: boolean;
    /**
     * to remove the X-Powered-By header
     */
    hidePoweredBy: boolean;
}

const configSchema = Joi.object().keys({
    dnsPrefetchControl: Joi.boolean(),
    frameguard: Joi.string().valid('DENY', 'ALLOW-FROM', 'SAMEORIGIN'),
    frameguardDomain: Joi.string(),
    hidePoweredBy: Joi.boolean(),
    noSniff: Joi.boolean(),
    xssFilter: Joi.boolean()
});

function validateConfig(config: FilterConfig) {
    const result = Joi.validate(config, configSchema);
    if (result.error) {
        throw new ValidationError(result.error);
    } else {
        return result.value;
    }
}

module.exports = function (config: FilterConfig) {
    config = _.defaults(config, {
        dnsPrefetchControl: true,
        frameguard: 'DENY',
        hidePoweredBy: true,
        noSniff: true,
        xssFilter: true
    });

    validateConfig(config);
    const options: any = {
        updateHeaders: {
        }
    };
    if (config.hidePoweredBy) {
        options.removeHeaders = 'X-Powered-By';
    }
    if (config.noSniff) {
        options.updateHeaders['X-Content-Type-Options'] = 'nosniff';
    }
    if (!config.dnsPrefetchControl) {
        options.updateHeaders['X-DNS-Prefetch-Control'] = 'off';
    }
    if (config.xssFilter) {
        options.updateHeaders['X-XSS-Protection'] = '1; mode=block';
    }
    if (config.frameguard) {
        let value: string = config.frameguard;
        if (value === 'ALLOW-FROM') {
            value = `${value} ${config.frameguardDomain}`;
        }
        options.updateHeaders['X-Frame-Options'] = value;
    }

    return responseHeaders(options);
};
module.exports.factory = true;
