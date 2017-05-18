'use strict';

import * as Joi from 'joi';
import { UsersConfig, usersConfigValidatorSchema } from './users';
import { AccessLoggerConfig, accessLoggerConfigSchema } from './logger';
import { ProtocolConfig, protocolConfigSchema } from './protocol';
import { CorsConfig, corsConfigSchema } from './cors';

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
     * If provided, the service will publish all api documentation under thie informed path.
     */
    apiDocs?: ApiDocs;
    /**
     * Configure cors support for API requests. It uses the [cors](https://www.npmjs.com/package/cors) module.
     */
    cors?: CorsConfig;
}

export interface ApiDocs {
    /**
     * The path where deploy the docs.
     */
    path: string;
    /**
     * The hostname where swagger will point the operations
     */
    host?: string;
}

export const adminConfigValidatorSchema = Joi.object().keys({
    accessLogger: accessLoggerConfigSchema,
    apiDocs: Joi.object().keys({
        host: Joi.string(),
        path: Joi.string().required()
    }),
    cors: corsConfigSchema,
    disableStats: Joi.boolean(),
    protocol: protocolConfigSchema.required(),
    userService: usersConfigValidatorSchema.required()
});
