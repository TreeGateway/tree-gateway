'use strict';

import * as Joi from 'joi';
import { MiddlewareConfig, middlewareConfigValidatorSchema } from './middleware';

/**
 * Configure Service Discovery Providers for APIs
 */
export interface ServiceDiscoveryConfig {
    provider: Array<MiddlewareConfig>;
}

export let serviceDiscoveryConfigValidatorSchema = Joi.object().keys({
    provider: Joi.array().items(middlewareConfigValidatorSchema).required()
});
