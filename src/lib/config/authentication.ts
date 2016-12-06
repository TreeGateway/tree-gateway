"use strict";

import * as Joi from "joi";

export interface AuthenticationConfig {
    /**
     * The strategy used for authentication
     */
    strategy: AuthenticationStrategyConfig;
    /**
     * A list of groups that should be handled by this authenticator. If not provided, everything
     * will be handled.
     * Defaults to *.
     */
    group?: Array<string>;
    /**
     * If true, disabled the statistical data recording.
     */
    disableStats?: boolean;
}

export interface AuthenticationStrategyConfig {
    jwt?: JWTAuthentication;
    basic?: BasicAuthentication;
    local?: LocalAuthentication;
}

export interface BasicAuthentication {
    /**
     * Is a function with the parameters verify(userid, password, done) {
     *  - userid The username.
     *  - password The password.
     *  - done is a passport error first callback accepting arguments done(error, user, info)
     */    
    verify: string;
}

export interface LocalAuthentication {
    /**
     * Is a function with the parameters verify(userid, password, done) {
     *  - userid The username.
     *  - password The password.
     *  - done is a passport error first callback accepting arguments done(error, user, info)
     */    
    verify: string;
    /**
     * Optional, defaults to 'username'
     */
    usernameField?: string;
    /**
     * Optional, defaults to 'password'
     */
    passwordField?: string;
}

export interface JWTAuthentication {
    /**
     * Is a REQUIRED string or buffer containing the secret (symmetric) 
     * or PEM-encoded public key (asymmetric) for verifying the token's signature.
     */
    secretOrKey:string;
    /**
     * Defines how the JWT token will be extracted from request.
     */
    extractFrom?: JWTRequestExtractor; 
    /**
     * If defined the token issuer (iss) will be verified against this value.
     */
    issuer?: string;
    /**
     * If defined, the token audience (aud) will be verified against this value.
     */
    audience?: string;
    /**
     * List of strings with the names of the allowed algorithms. For instance, ["HS256", "HS384"].
     */
    algorithms?: Array<string>;
    /**
     * If true do not validate the expiration of the token.
     */
    ignoreExpiration?: boolean;
    /**
     * Is a function with the parameters verify(request, jwt_payload, done) 
     *  - request The user request.
     *  - jwt_payload is an object literal containing the decoded JWT payload.
     *  - done is a passport error first callback accepting arguments done(error, user, info)
     */    
    verify?: string;
}

export interface JWTRequestExtractor {
    header?: string;
    queryParam?: string;
    authHeader?: string;
    bodyField?: string;
    cookie?: string;
}

let JWTRequestExtractorSchema = Joi.object().keys({
    header: Joi.string(),
    queryParam: Joi.string(),
    authHeader: Joi.string(),
    bodyField: Joi.string(),
    cookie: Joi.string()
});

let JWTAuthenticationSchema = Joi.object().keys({
    secretOrKey: Joi.string().required(),
    extractFrom: JWTRequestExtractorSchema,
    issuer: Joi.string(),
    audience: Joi.string(),
    algorithms: Joi.array().items(Joi.string()),
    ignoreExpiration: Joi.boolean(),
    verify: Joi.string()
});

let BasicAuthenticationSchema = Joi.object().keys({
    verify: Joi.string().required()
});

let LocalAuthenticationSchema = Joi.object().keys({
    verify: Joi.string().required(),
    usernameField: Joi.string(),
    passwordField: Joi.string()
});

export let AuthenticationStrategyValidatorSchema = Joi.object().keys({
    jwt: JWTAuthenticationSchema,
    basic: BasicAuthenticationSchema,
    local: LocalAuthenticationSchema,
}).unknown(true).length(1);

export let AuthenticationValidatorSchema = Joi.object().keys({
    strategy: AuthenticationStrategyValidatorSchema.required(),
    group: Joi.array().items(Joi.string()), 
    disableStats: Joi.boolean()
});

export function validateAuthenticationConfig(authentication: AuthenticationConfig, callback: (err, value)=>void) {
    Joi.validate(authentication, AuthenticationValidatorSchema, callback);
}