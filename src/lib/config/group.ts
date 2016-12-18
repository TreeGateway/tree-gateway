"use strict";

import * as Joi from "joi";

/**
 * Configurations for groups of endpoints.
 */
export interface Group {
    /**
     * The Group name. Used to identify the Group on admin console. 
     */
    name: string;
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
    path: Array<string>;
    method: Array<string>;
}

let MemberValidatorSchema = Joi.object().keys({
    path: Joi.array().items(Joi.string().regex(/^[a-z\-\/]+$/i)),
    method: Joi.array().items(Joi.string().valid('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD')),
}).min(1);

export let GroupValidatorSchema = Joi.object().keys({
    name: Joi.string().alphanum().min(3).max(30).required(),
    description: Joi.string(),
    member: Joi.array().items(MemberValidatorSchema).required(),
});

export function validateGroup(group: Group) {
    return new Promise((resolve, reject) => {
        Joi.validate(group, GroupValidatorSchema, (err, value) => {
            if (err) {
                reject(err);
            } else {
                resolve(value);
            }
        })
    });
}