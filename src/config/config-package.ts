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
    /**
     * Configurations for middlewares.
     */
    middlewares?: Array<MiddlewareConfig>;
}

export interface MiddlewareConfig {
    middleware: string;
    name: string;
    content: string;
}

export let configPackageValidatorSchema = Joi.object().keys({
    apis: Joi.array().items(apiConfigValidatorSchema),
    gateway: gatewayConfigValidatorSchema,
    middlewares: Joi.array().items(Joi.object().keys({
        content: Joi.string().required(),
        middleware: Joi.string().required(),
        name: Joi.string().required()
    }))
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
