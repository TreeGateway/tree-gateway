'use strict';

import * as Joi from 'joi';
import { UsersConfig, usersConfigValidatorSchema } from './users';
import { AccessLoggerConfig, accessLoggerConfigSchema } from './logger';
import { ProtocolConfig, protocolConfigSchema } from './protocol';
import { CorsConfig, corsConfigSchema } from './cors';
import { ValidationError } from '../error/errors';

/**
 * Configure the Admin module for the gateway.
 */
export interface AdminConfig {
    /**
     * The gateway admin server protocol configurations
     */
    protocol: ProtocolConfig;

    /**
     * Configurations for gateway users service
     */
    userService: UsersConfig;
    /**
     * Configurations for gateway access logger.
     */
    accessLogger?: AccessLoggerConfig;
    /**
     * If true, disabled the statistical data recording for admin tasks.
     */
    disableStats?: boolean;
    /**
     * If provided, the service will publish all api documentation under this path.
     */
    apiDocs?: string;
    /**
     * Configure cors support for API requests. It uses the [cors](https://www.npmjs.com/package/cors) module.
     */
    cors?: CorsConfig;
}

export const adminConfigValidatorSchema = Joi.object().keys({
    accessLogger: accessLoggerConfigSchema,
    apiDocs: Joi.string(),
    cors: corsConfigSchema,
    disableStats: Joi.boolean(),
    protocol: protocolConfigSchema.required(),
    userService: usersConfigValidatorSchema.required()
});

export function validateAdminConfig(config: AdminConfig) {
    return new Promise((resolve, reject) => {
        Joi.validate(config, adminConfigValidatorSchema, (err, value) => {
            if (err) {
                reject(new ValidationError(err));
            } else {
                resolve(value);
            }
        });
    });
}
