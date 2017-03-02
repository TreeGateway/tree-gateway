"use strict";

import * as Joi from "joi";

export interface ProtocolConfig {
    http?: HttpConfig;
    https?: HttpsConfig;
}

export interface HttpConfig {
    /**
     * The gateway port
     */
    listenPort: number;
}

export interface HttpsConfig {
    /**
     * The gateway port
     */
    listenPort: number;
    /**
     * Path to the private key file.
     */
    privateKey: string;
    /**
     * Path to the certificate file.
     */
    certificate: string;
}

let HttpConfigSchema = Joi.object().keys({
    listenPort: Joi.number().positive().required(),
});

let HttpsConfigSchema = Joi.object().keys({
    listenPort: Joi.number().positive().required(),
    privateKey: Joi.string().required(),
    certificate: Joi.string().required()

});

export let ProtocolConfigSchema = Joi.object().keys({
    http: HttpConfigSchema,
    https: HttpsConfigSchema
}).min(1);
