'use strict';

import * as Joi from 'joi';

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

const httpConfigSchema = Joi.object().keys({
    listenPort: Joi.number().positive().required()
});

const httpsConfigSchema = Joi.object().keys({
    certificate: Joi.string().required(),
    listenPort: Joi.number().positive().required(),
    privateKey: Joi.string().required()

});

export let protocolConfigSchema = Joi.object().keys({
    http: httpConfigSchema,
    https: httpsConfigSchema
}).min(1);
