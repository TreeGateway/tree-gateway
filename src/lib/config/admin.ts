"use strict";

import * as Joi from "joi";
import {UsersConfig, UsersConfigValidatorSchema} from "./users";
import {AccessLoggerConfig, AccessLoggerConfigSchema} from "./logger";
import {ProtocolConfig, ProtocolConfigSchema} from "./protocol";
import {CorsConfig, CorsConfigSchema} from "./cors";
import {ValidationError} from "../error/errors";

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
    cors?: CorsConfig
}

export let AdminConfigValidatorSchema = Joi.object().keys({
    protocol: ProtocolConfigSchema.required(),
    userService: UsersConfigValidatorSchema.required(),
    accessLogger: AccessLoggerConfigSchema,
    disableStats: Joi.boolean(), 
    apiDocs: Joi.string(),
    cors: CorsConfigSchema
});

export function validateAdminConfig(config: AdminConfig) {
    return new Promise((resolve, reject) => {
        Joi.validate(config, AdminConfigValidatorSchema, (err, value)=>{
            if (err) {
                reject(new ValidationError(err));
            } else {
                resolve(value);
            }
        });
    })
}