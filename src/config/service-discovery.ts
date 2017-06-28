'use strict';

import * as Joi from 'joi';
import { MiddlewareConfig, middlewareConfigValidatorSchema } from './middleware';

/**
 * a
 */
export interface ServiceDiscoveryConfig {
    provider: Array<MiddlewareConfig>;
}

/**
 * a
 */
export let serviceDiscoveryConfigValidatorSchema = Joi.object().keys({
    provider: Joi.array().items(middlewareConfigValidatorSchema).required()
});
