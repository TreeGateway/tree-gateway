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
    /**
     * Path to the certificateAuthority file.
     */
    certificateAuthority?: string;
    /**
     * A list of Ciphers to use.
     */
    ciphers?: Array<string>;
    /**
     * When choosing a cipher, use the server's preferences
     * instead of the client preferences.
     */
    honorCipherOrder?: boolean;
}

const httpConfigSchema = Joi.object().keys({
    listenPort: Joi.alternatives([Joi.number().positive(), Joi.string()]).required(),
});

const httpsConfigSchema = Joi.object().keys({
    certificate: Joi.string().required(),
    certificateAuthority: Joi.string(),
    ciphers: Joi.array().items(Joi.string()),
    honorCipherOrder: Joi.boolean(),
    listenPort: Joi.alternatives([Joi.number().positive(), Joi.string()]).required(),
    privateKey: Joi.string().required()

});

export let protocolConfigSchema = Joi.object().keys({
    http: httpConfigSchema,
    https: httpsConfigSchema
}).min(1);
