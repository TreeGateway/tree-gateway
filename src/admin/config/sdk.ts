'use strict';

import { Apis, ApisClient } from './sdk-apis';
import { Config, ConfigClient } from './sdk-config-package';
import { Gateway, GatewayClient } from './sdk-gateway';
import { Middleware, MiddlewareClient } from './sdk-middleware';
import { Users, UsersClient } from './sdk-users';

const swagger = require('swagger-client');

export interface SDKOptions {
    swaggerUrl: string;
    token: string;
    defaultHost?: string;
}

export class SDK {
    public static async initialize(options: SDKOptions): Promise<SDK> {
        if (!options || !options.token ||
            !options.swaggerUrl) {
            throw new Error('Invalid parameters. You must informa a valid authentication token and a valid URL to the gateway swagger file.');
        }

        const swaggerClient = await swagger(options.swaggerUrl, {
            authorizations: {
                Bearer: `Bearer ${options.token}`
            }
        });
        if (!swaggerClient.spec) {
            swaggerClient.spec = {};
        }
        if (!swaggerClient.spec.host && options.defaultHost) {
            swaggerClient.spec.host = options.defaultHost;
        }

        return new SDK(swaggerClient, options.token);
    }

    private apisClient: Apis;
    private gatewayClient: Gateway;
    private middlewareClient: Middleware;
    private usersClient: Users;
    private configClient: Config;

    private constructor(swaggerClient: any, authToken: string) {
        this.apisClient = new ApisClient(swaggerClient);
        this.configClient = new ConfigClient(swaggerClient);
        this.gatewayClient = new GatewayClient(swaggerClient);
        this.middlewareClient = new MiddlewareClient(swaggerClient, authToken);
        this.usersClient = new UsersClient(swaggerClient);
    }

    get apis(): Apis {
        return this.apisClient;
    }

    get config(): Config {
        return this.configClient;
    }

    get gateway(): Gateway {
        return this.gatewayClient;
    }

    get middleware(): Middleware {
        return this.middlewareClient;
    }

    get users(): Users {
        return this.usersClient;
    }
}
