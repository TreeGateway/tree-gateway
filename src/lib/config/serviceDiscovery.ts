"use strict";

import * as Joi from "joi";

export interface ServiceDiscoveryConfig {
}

export let ServiceDiscoveryConfigValidatorSchema = Joi.object().keys({
});

export function validateServiceDiscoveryConfig(serviceDiscovery: ServiceDiscoveryConfig, callback: (err, value)=>void) {
    Joi.validate(serviceDiscovery, ServiceDiscoveryConfigValidatorSchema, callback);
}