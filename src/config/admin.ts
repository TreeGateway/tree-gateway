'use strict';

import * as Joi from 'joi';
import { UsersConfig, usersConfigValidatorSchema } from './users';
import { AccessLoggerConfig, accessLoggerConfigSchema } from './logger';
import { ProtocolConfig, protocolConfigSchema } from './protocol';
import { CorsConfig, corsConfigSchema } from './cors';
import { StatsConfig, statsConfigValidatorSchema } from './stats';
import { MiddlewareConfig, middlewareConfigValidatorSchema } from './middleware';

/**
 * Configure the Admin module for the gateway.
 */
export interface AdminConfig {
    /**
     * The gateway admin server protocol configurations
     */
    protocol: ProtocolConfig;

    /**
     * Configurations for admin users service
     */
    userService: UsersConfig;
    /**
     * Configurations for gateway admin server access logger.
     */
    accessLogger?: AccessLoggerConfig;
    /**
     * If true, disabled the statistical data recording for admin tasks.
     */
    disableStats?: boolean;
    /**
     * Configurations for admin stats.
     */
    statsConfig?: StatsConfig;
    /**
     * If provided, the service will publish all api documentation under the informed path.
     */
    apiDocs?: ApiDocs;
    /**
     * Configure cors support for Admin API requests. It uses the [cors](https://www.npmjs.com/package/cors) module.
     */
    cors?: CorsConfig;
    /**
     * Add filters to the request pipeline. A Filter is a function that receives
     * the request and the response object and must return a boolean value to inform
     * it the given request should target the destination API or if it should be ignored.
     *
     * Example:
     * ```
     * module.exports = function (req) {
     *   return true;
     * };
     * ```
     *
     * Each filter must be defined on its own .js file (placed on middleware/filter folder)
     * and the fileName must match: <filterName>.js.
     *
     * So, the above filter should be saved in a file called myFilter.js and configured as:
     * ```
     * filter:[
     *   { name: "myFilter"}
     * ]
     * ```
     */
    filter?: Array<MiddlewareConfig>;
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
    filter: Joi.array().items(middlewareConfigValidatorSchema),
    protocol: protocolConfigSchema.required(),
    statsConfig: statsConfigValidatorSchema,
    userService: usersConfigValidatorSchema.required()
});
