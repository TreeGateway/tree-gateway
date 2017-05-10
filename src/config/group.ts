'use strict';

import * as Joi from 'joi';
import { ValidationError } from '../error/errors';

/**
 * Configurations for groups of endpoints.
 */
export interface Group {
    /**
     * The Group identifier. Used to identify the Group on admin console.
     */
    id: string;
    /**
     * An optional description for API.
     */
    description?: string;
    /**
     * A list of group members.
     */
    member: Array<Member>;
}

export interface Member {
    path?: Array<string>;
    method?: Array<string>;
    protocol?: Array<string>;
}

const memberValidatorSchema = Joi.object().keys({
    method: Joi.array().items(Joi.string().valid('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD')),
    path: Joi.array().items(Joi.string().regex(/^[a-z\-\/]+$/i)),
    protocol: Joi.array().items(Joi.string().alphanum())
}).min(1);

export const groupValidatorSchema = Joi.object().keys({
    description: Joi.string(),
    id: Joi.string().alphanum().min(3).max(30).required(),
    member: Joi.array().items(memberValidatorSchema).required()
});

export function validateGroup(group: Group) {
    return new Promise((resolve, reject) => {
        Joi.validate(group, groupValidatorSchema, (err, value) => {
            if (err) {
                reject(new ValidationError(err));
            } else {
                resolve(value);
            }
        });
    });
}
