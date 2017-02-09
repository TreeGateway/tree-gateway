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
    userService?: string;
    defaultService?: DefaultUsersConfig; 
}

export interface DefaultUsersConfig {
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
    /**
     * A custom service that implement the UserService interface.
     */
    userService: Joi.string(),
    /**
     * Configurations for the default user service. This service will use redis to store user information
     * and JWT tokens to validate user authentication
     */
    defaultService: Joi.object().keys({
        jwtSecret: Joi.string().required()
    })
}).min(1).max(1);

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