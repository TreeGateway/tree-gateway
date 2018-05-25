'use strict';

import * as Joi from 'joi';

/**
 * Configurations for groups of endpoints.
 */
export interface Group {
    /**
     * The Group identifier. Used to identify the Group on admin console.
     */
    id: string;
    /**
     * An optional description for the group.
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

const methodValidator = Joi.string().valid('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD');
const pathString = Joi.string().regex(/^!?[A-Za-z\-\/0-9_\.\*\|\(\)]+$/i);
const memberValidatorSchema = Joi.object().keys({
    method: Joi.alternatives([Joi.array().items(methodValidator), methodValidator]),
    path: Joi.alternatives([Joi.array().items(pathString),pathString]),
    protocol: Joi.alternatives([Joi.array().items(Joi.string()), Joi.string()]),
}).min(1);

export const groupValidatorSchema = Joi.object().keys({
    description: Joi.string(),
    id: Joi.string().min(1).required(),
    member: Joi.alternatives([Joi.array().items(memberValidatorSchema), memberValidatorSchema]).required()
});
