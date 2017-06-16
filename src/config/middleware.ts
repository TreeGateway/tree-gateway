'use strict';

import * as Joi from 'joi';

/**
 * A reference to a middleware
 */
export interface MiddlewareConfig {
    /**
     * The name of the middleware
     */
    name: string;
    /**
     * Options to be passed to middleware initialization
     */
    options?: any;
}

export let middlewareConfigValidatorSchema = Joi.object().keys({
    name: Joi.string().required(),
    options: Joi.object().unknown(true)
});
