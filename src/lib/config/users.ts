"use strict";

import * as Joi from "joi";
import {ValidationError} from "../error/errors";

export interface UserData {
    /**
     * User name
     */
    name: string;
    /**
     * User login
     */
    login: string;
    /**
     * The user password
     */
    password: string;
    /**
     * The user email
     */
    email?: string;
    /**
     * The user roles
     */
    roles?: Array<string>;
}

export interface UsersConfig {
    jwtSecret: string;
}

export let UserValidatorSchema = Joi.object().keys({
    name: Joi.string().required(),
    login: Joi.string().alphanum().required(),
    password: Joi.string().required(),
    email: Joi.string().email(),
    roles: Joi.array().items(Joi.string()).unique()
});


export let UsersConfigValidatorSchema = Joi.object().keys({
    jwtSecret: Joi.string().required()
});

export function validateUser(user: UserData) {
    return new Promise((resolve, reject) => {
        Joi.validate(user, UserValidatorSchema, (err, value)=>{
            if (err) {
                reject(new ValidationError(err));
            } else {
                resolve(value);
            }
        });
    })
}