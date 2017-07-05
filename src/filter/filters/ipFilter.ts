'use strict';

import * as Joi from 'joi';
import * as _ from 'lodash';
import * as express from 'express';
import { ValidationError } from '../../error/errors';
import { Container } from 'typescript-ioc';
import { getMilisecondsInterval } from '../../utils/time-intervals';
import { PluginsDataService } from '../../service/plugin-data';

const ipFilter = require('ip-filter');
const IPV6_PREFIX = '::ffff:';

interface IpFilterConfig {
    blacklist?: Array<string>;
    database?: IpFilterDatabaseConfig;
    message?: string;
    statusCode?: number;
    whitelist?: Array<string>;
}

interface IpFilterDatabaseConfig {
    key?: string;
    checkInterval?: string | number;
}

const ipFilterConfigSchema = Joi.object().keys({
    blacklist: Joi.array().items(Joi.string()),
    database: Joi.object().keys({
        checkInterval: Joi.alternatives([Joi.string(), Joi.number().positive()]),
        key: Joi.string()
    }),
    message: Joi.string(),
    statusCode: Joi.number(),
    whitelist: Joi.array().items(Joi.string())
}).xor('blacklist', 'whitelist');

function validateIpFilterConfig(config: IpFilterConfig) {
    const result = Joi.validate(config, ipFilterConfigSchema);
    if (result.error) {
        throw new ValidationError(result.error);
    } else {
        return result.value;
    }
}

function getBlacklistFilter(config: IpFilterConfig) {
    config.blacklist = config.blacklist || [];
    let blocked: Array<string> = config.blacklist;
    if (config.database) {
        const pluginsDataService: PluginsDataService = Container.get(PluginsDataService);
        pluginsDataService.on('changed', (data: Array<string>) => {
            blocked = _.union(config.blacklist, data || []);
        });
        pluginsDataService.watchConfigurationItems(config.database.key || 'ipFilter:blacklist',
                                    getMilisecondsInterval(config.database.checkInterval, 30000));
    }
    return (req: express.Request, res: express.Response) => {
        if (!blocked || !blocked.length) {
            return true;
        }
        let ip: string = req.ip || req.connection.remoteAddress;
        let allowed = !ipFilter(ip, blocked, { strict: false });
        if (allowed && ip.startsWith(IPV6_PREFIX)) {
            ip = ip.substring(IPV6_PREFIX.length);
            allowed = !ipFilter(ip, blocked, { strict: false });
        }
        if (!allowed) {
            res.status(config.statusCode || 403).send(config.message || 'Not allowed.');
        }
        return allowed;
    };
}

function getWhitelistFilter(config: IpFilterConfig) {
    config.whitelist = config.whitelist || [];
    let unblocked: Array<string> = config.whitelist;
    if (config.database) {
        const pluginsDataService: PluginsDataService = Container.get(PluginsDataService);
        pluginsDataService.on('changed', (data: Array<string>) => {
            unblocked = _.union(config.whitelist, data || []);
        });
        pluginsDataService.watchConfigurationItems(config.database.key || '{ipFilter}:whitelist',
                                    getMilisecondsInterval(config.database.checkInterval, 30000));
    }
    return (req: express.Request, res: express.Response) => {
        if (!unblocked) {
            return true;
        }
        let ip: string = req.ip || req.connection.remoteAddress;
        let allowed = ipFilter(ip, unblocked, { strict: false });
        if (!allowed && ip.startsWith(IPV6_PREFIX)) {
            ip = ip.substring(IPV6_PREFIX.length);
            allowed = ipFilter(ip, unblocked, { strict: false });
        }
        if (!allowed) {
            res.status(config.statusCode || 403).send(config.message || 'IP not allowed.');
        }
        return allowed;
    };
}

module.exports = function(config: IpFilterConfig) {
    validateIpFilterConfig(config);
    if (config.whitelist) {
        return getWhitelistFilter(config);
    }
    return getBlacklistFilter(config);
};
