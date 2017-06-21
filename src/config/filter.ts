'use strict';

import * as Joi from 'joi';
import { MiddlewareConfig, middlewareConfigValidatorSchema } from './middleware';

/**
 * Add filters to the request pipeline. A Filter is a function that receives
 * the request and the response object and must return a boolean value to inform
 * it the given request should target the destination API or if it should be ignored.
 */
export interface Filter {
    /**
     * The filter to be used.
     */
    middleware: MiddlewareConfig;
    /**
     * A list of groups that should be filtered by this filter. If not provided, everything
     * will be filtered.
     * Defaults to *.
     */
    group?: Array<string>;
}

export const filterSchema = Joi.object().keys({
    group: Joi.array().items(Joi.string()),
    middleware: middlewareConfigValidatorSchema.required()
});
