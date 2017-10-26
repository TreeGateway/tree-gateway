'use strict';

import * as Joi from 'joi';
import { GatewayConfig, gatewayConfigValidatorSchema } from './gateway';
import { ApiConfig, apiConfigValidatorSchema } from './api';
import { ValidationError } from '../error/errors';

/**
 * The Server config descriptor.
 */
export interface ConfigPackage {
    /**
     * The gateway configuration.
     */
    gateway?: GatewayConfig;
    /**
     * Configurations for apis.
     */
    apis?: Array<ApiConfig>;
}

export let configPackageValidatorSchema = Joi.object().keys({
    apis: Joi.array().items(apiConfigValidatorSchema),
    gateway: gatewayConfigValidatorSchema
});

export function validateConfigPackage(configPackage: ConfigPackage) {
    return new Promise((resolve, reject) => {
        Joi.validate(configPackage, configPackageValidatorSchema, (err, value) => {
            if (err) {
                reject(new ValidationError(err));
            } else {
                resolve(value);
            }
        });
    });
}
