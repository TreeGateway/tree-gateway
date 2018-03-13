'use strict';

import * as Joi from 'joi';
import { ValidationError } from './errors';

/**
 * A [jsonata](https://www.npmjs.com/package/jsonata) expression, used by core interceptors
 * to transform responses.
 */
export interface JSONAtaExpression {
    /**
     * The jsonata expressio
     */
    expression: string;
}

const jsonataExpressionSchema = Joi.object().keys({
    expression: Joi.string().required()
});

export function validateJsonAtaExpression(config: JSONAtaExpression) {
    const result = Joi.validate(config, jsonataExpressionSchema);
    if (result.error) {
        throw new ValidationError(result.error);
    } else {
        return result.value;
    }
}
