'use strict';

import * as Joi from 'joi';

/**
 * A reference to a middleware
 */
export interface MiddlewareConfig {
    /**
     * The name of the middleware
     */
    id?: string;
    /**
     * An alias for the middleware ID. It cause the same effect then configure id property
     */
    name?: string;
    /**
     * Options to be passed to middleware initialization
     */
    options?: any;
}

export let middlewareConfigValidatorSchema = Joi.object().keys({
    id: Joi.string(),
    name: Joi.string(),
    options: Joi.object().unknown(true)
}).xor('id', 'name');
