'use strict';

import * as Joi from 'joi';

export interface ProtocolConfig {
    http?: HttpConfig;
    https?: HttpsConfig;
}

export interface HttpConfig {
    /**
     * The listen port
     */
    listenPort: string | number;
}

export interface HttpsConfig {
    /**
     * The listn port
     */
    listenPort: string | number;
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
    listenPort: Joi.alternatives([Joi.number().positive(), Joi.string()]).required(),
});

const httpsConfigSchema = Joi.object().keys({
    certificate: Joi.string().required(),
    listenPort: Joi.alternatives([Joi.number().positive(), Joi.string()]).required(),
    privateKey: Joi.string().required()

});

export let protocolConfigSchema = Joi.object().keys({
    http: httpConfigSchema,
    https: httpsConfigSchema
}).min(1);
