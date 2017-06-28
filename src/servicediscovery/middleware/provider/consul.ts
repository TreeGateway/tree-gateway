'use strict';

import * as Joi from 'joi';
import * as consul from 'consul';
import { ValidationError } from '../../../error/errors';
import { checkEnvVariable } from '../../../utils/env';
import * as fs from 'fs-extra-promise';

interface ConsultConfig {
    /**
     * Agent address. Default: 127.0.0.1
     */
    host?: string;
    /**
     * Agent HTTP(S) port. Default: 8500
     */
    port?: string | number;
    /**
     * Enable HTTPS. Default: false
     */
    secure?: boolean;
    /**
     * Trusted certificates in PEM format
     */
    ca?: Array<string>;
    /**
     * Default options for method calls
     */
    defaults?: DefaultsConsulConfig;
}

interface DefaultsConsulConfig {
    /**
     * Datacenter (defaults to local for agent)
     */
    dc?: string;
    /**
     * Return WAN members instead of LAN members. Default: false
     */
    wan?: boolean;
    /**
     * require strong consistency. Default: false
     */
    consistent?: boolean;
    /**
     * Use whatever is available, can be arbitrarily stale. Default: false
     */
    stale?: boolean;
    /**
     * Used with ModifyIndex to block and wait for changes
     */
    index?: string;
    /**
     * Limit how long to wait for changes (ex: 5m), used with index
     */
    wait?: string;
    /**
     * ACL token
     */
    token?: string;
}

const defaultsConsulConfigSchema = Joi.object().keys({
    consistent: Joi.boolean(),
    dc: Joi.string(),
    index: Joi.string(),
    stale: Joi.boolean(),
    token: Joi.string(),
    wait: Joi.string(),
    wan: Joi.boolean()
});

const consulConfigSchema = Joi.object().keys({
    ca: Joi.array().items(Joi.string()),
    defaults: defaultsConsulConfigSchema,
    host: Joi.string(),
    port: Joi.alternatives([Joi.string(), Joi.number().positive()]),
    secure: Joi.boolean()
});

function validateConsulConfig(config: ConsultConfig) {
    const result = Joi.validate(config, consulConfigSchema);
    if (result.error) {
        throw new ValidationError(result.error);
    } else {
        return result.value;
    }
}

module.exports = function(config: ConsultConfig) {
    validateConsulConfig(config);

    const consulConfig: consul.ConsulOptions = {};

    if (config.host) {
        consulConfig.host = checkEnvVariable(config.host);
    }
    if (config.port) {
        consulConfig.port = checkEnvVariable(config.port);
    }
    if (config.secure) {
        consulConfig.secure = config.secure;
    }
    if (config.defaults) {
        consulConfig.defaults = config.defaults;
    }
    if (config.ca) {
        consulConfig.ca = <any[]>config.ca.map(ca => fs.readFileSync(ca));
    }
    return () => {
        return consul(consulConfig);
    };
};
