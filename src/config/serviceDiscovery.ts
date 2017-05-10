'use strict';

import * as Joi from 'joi';
import { ValidationError } from '../error/errors';

export interface ServiceDiscoveryConfig {
}

export let serviceDiscoveryConfigValidatorSchema = Joi.object().keys({
});

export function validateServiceDiscoveryConfig(serviceDiscovery: ServiceDiscoveryConfig) {
    return new Promise((resolve, reject) => {
        Joi.validate(serviceDiscovery, serviceDiscoveryConfigValidatorSchema, (err, value) => {
            if (err) {
                reject(new ValidationError(err));
            } else {
                resolve(value);
            }
        });
    });
}
