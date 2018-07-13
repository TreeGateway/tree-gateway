'use strict';

import * as consul from 'consul';
import * as fs from 'fs-extra-promise';
import * as Joi from 'joi';
import * as _ from 'lodash';
import { ValidationError } from '../../../../config/errors';
import { getMilisecondsInterval } from '../../../../utils/time-intervals';

interface ConsulConfig {
    /**
     * Agent address. Default: 127.0.0.1. It is not recommended to access
     * consul agent remotely. [see this](https://github.com/hashicorp/consul/issues/1916)
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
     * Limit how long to wait for changes (ex: 5 minutes), used with index
     */
    wait?: string | number;
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
    wait: Joi.alternatives([Joi.string(), Joi.number().positive()]),
    wan: Joi.boolean()
});

const consulConfigSchema = Joi.object().keys({
    ca: Joi.alternatives([Joi.array().items(Joi.string()), Joi.string()]),
    defaults: defaultsConsulConfigSchema,
    host: Joi.string(),
    port: Joi.alternatives([Joi.string(), Joi.number().positive()]),
    secure: Joi.boolean()
});

function validateConsulConfig(config: ConsulConfig) {
    const result = Joi.validate(config, consulConfigSchema);
    if (result.error) {
        throw new ValidationError(result.error);
    } else {
        return result.value;
    }
}

module.exports = function (config: ConsulConfig) {
    validateConsulConfig(config);

    const consulConfig: consul.ConsulOptions = {};

    if (config.host) {
        consulConfig.host = config.host;
    }
    if (config.port) {
        consulConfig.port = `${config.port}`;
    }
    if (config.secure) {
        consulConfig.secure = config.secure;
    }
    if (config.defaults) {
        if (config.defaults.wait) {
            config.defaults.wait = `${getMilisecondsInterval(config.defaults.wait)}ms`;
        }
        consulConfig.defaults = config.defaults as any;
    }
    if (config.ca) {
        config.ca = _.castArray(config.ca);
        consulConfig.ca = config.ca.map(ca => fs.readFileSync(ca)) as Array<any>;
    }
    return () => {
        return consul(consulConfig);
    };
};
module.exports.factory = true;
