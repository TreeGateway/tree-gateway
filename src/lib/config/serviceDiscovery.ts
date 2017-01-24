"use strict";

import * as Joi from "joi";

export interface ServiceDiscoveryConfig {
}

export let ServiceDiscoveryConfigValidatorSchema = Joi.object().keys({
});

export function validateServiceDiscoveryConfig(serviceDiscovery: ServiceDiscoveryConfig) {
    return new Promise((resolve, reject) => {
        Joi.validate(serviceDiscovery, ServiceDiscoveryConfigValidatorSchema, (err, value)=>{
            if (err) {
                reject(err);
            } else {
                resolve(value);
            }
        });
    })
}