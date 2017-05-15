'use strict';

import { Apis, ApisClient } from './sdk-apis';
import { Gateway, GatewayClient } from './sdk-gateway';
import { Middleware, MiddlewareClient } from './sdk-middleware';

const swagger = require('swagger-client');

export class SDK {
    private apisClient: Apis;
    private gatewayClient: Gateway;
    private middlewareClient: Middleware;

    private constructor(swaggerClient: any, authToken: string) {
        this.apisClient = new ApisClient(swaggerClient);
        this.gatewayClient = new GatewayClient(swaggerClient);
        this.middlewareClient = new MiddlewareClient(swaggerClient, authToken);
    }

    static initialize(swaggerUrl: string, login: string, password: string): Promise<SDK> {
        return new Promise<SDK>((resolve, reject) => {
            let authToken: string = null;
            SDK.authenticate(swaggerUrl, login, password)
                .then(token => {
                    authToken = token;
                    return swagger(swaggerUrl, {
                        authorizations: {
                            Bearer: `JWT ${token}`
                        }
                    });
                })
                .then((swaggerClient: any) => {
                    resolve(new SDK(swaggerClient, authToken));
                })
                .catch(reject);
        });
    }

    static authenticate(swaggerUrl: string, login: string, password: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            swagger(swaggerUrl)
                .then((swaggerClient: any) => {
                    return swaggerClient.apis.Users.UsersRestGetAuthToken({login, password});
                })
                .then((response: any) => {
                    if (response.status === 200) {
                        return resolve(response.text);
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    get apis(): Apis {
        return this.apisClient;
    }

    get gateway(): Gateway {
        return this.gatewayClient;
    }

    get middleware(): Middleware {
        return this.middlewareClient;
    }
}
