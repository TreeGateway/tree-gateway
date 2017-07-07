'use strict';

import * as Joi from 'joi';
import { ValidationError } from '../error/errors';

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

export const userValidatorSchema = Joi.object().keys({
    email: Joi.string().email(),
    login: Joi.string().required(),
    name: Joi.string().required(),
    password: Joi.string(),
    roles: Joi.array().items(Joi.string()).unique()
});

export const usersConfigValidatorSchema = Joi.object().keys({
    jwtSecret: Joi.string().required()
});

export function validateUser(user: UserData) {
    return new Promise((resolve, reject) => {
        Joi.validate(user, userValidatorSchema, (err, value) => {
            if (err) {
                reject(new ValidationError(err));
            } else {
                resolve(value);
            }
        });
    });
}
