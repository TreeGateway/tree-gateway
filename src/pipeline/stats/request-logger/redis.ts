'use strict';
import * as Joi from 'joi';
import { Container } from 'typescript-ioc';
import { ValidationError } from '../../../config/errors';
import { Database } from '../../../database';
import { RequestLog } from '../request';

const LOG_KEY = '{REQUEST_LOG}';

interface RequestLogConfig {
    maxEntries?: number;
}

const requestLogSchema = Joi.object().keys({
    maxEntries: Joi.number()
});

function validateRequestLogConfig(config: RequestLogConfig) {
    const result = Joi.validate(config, requestLogSchema);
    if (result.error) {
        throw new ValidationError(result.error);
    } else {
        return result.value;
    }
}

module.exports = (config: RequestLogConfig) => {
    validateRequestLogConfig(config);
    const database: Database = Container.get(Database);

    return (requestLog: RequestLog) => {
        database.redisClient.multi()
            .lpush(LOG_KEY, JSON.stringify(requestLog))
            .ltrim(LOG_KEY, 0, config.maxEntries || 10000)
            .exec();
    };
};

module.exports.factory = true;
