"use strict";

import * as Joi from "joi";
import {UsersConfig, UsersConfigValidatorSchema} from "./users";
import {AccessLoggerConfig, AccessLoggerConfigSchema} from "./logger";
import {ProtocolConfig, ProtocolConfigSchema} from "./protocol";


export interface AdminConfig {
    /**
     * The gateway admin server protocol configurations
     */
    protocol: ProtocolConfig;

    /**
     * Configurations for gateway users service
     */
    users: UsersConfig;
    /**
     * Configurations for gateway access logger.
     */
    accessLogger?: AccessLoggerConfig;
    /**
     * If true, disabled the statistical data recording for admin tasks.
     */
    disableStats?: boolean;    
}

export let AdminConfigValidatorSchema = Joi.object().keys({
    protocol: ProtocolConfigSchema.required(),
    users: UsersConfigValidatorSchema.required(),
    accessLogger: AccessLoggerConfigSchema,
    disableStats: Joi.boolean(), 

});

export function validateAdminConfig(config: AdminConfig) {
    return new Promise((resolve, reject) => {
        Joi.validate(config, AdminConfigValidatorSchema, (err, value)=>{
            if (err) {
                reject(err);
            } else {
                resolve(value);
            }
        });
    })
}