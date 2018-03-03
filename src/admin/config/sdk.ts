'use strict';

import { Apis, ApisClient } from './sdk-apis';
import { Config, ConfigClient } from './sdk-config-package';
import { Users, UsersClient } from './sdk-users';
import { Gateway, GatewayClient } from './sdk-gateway';
import { Middleware, MiddlewareClient } from './sdk-middleware';
import { GatewayConfig } from '../../config/gateway';
import * as path from 'path';
import { getSwaggerHost } from '../../utils/config';
import * as jwt from 'jsonwebtoken';

const swagger = require('swagger-client');

export class SDK {
    private apisClient: Apis;
    private gatewayClient: Gateway;
    private middlewareClient: Middleware;
    private usersClient: Users;
    private configClient: Config;

    private constructor(swaggerClient: any, authToken: string, gateway: GatewayConfig) {
        this.apisClient = new ApisClient(swaggerClient);
        this.configClient = new ConfigClient(swaggerClient);
        this.gatewayClient = new GatewayClient(swaggerClient);
        this.middlewareClient = new MiddlewareClient(swaggerClient, authToken, gateway);
        this.usersClient = new UsersClient(swaggerClient);
    }

    static initialize(gateway: GatewayConfig): Promise<SDK> {
        return new Promise<SDK>((resolve, reject) => {
            const token: string = SDK.generateSecurityToken(gateway);
            const swaggerUrl = SDK.getSwaggerUrl(gateway);
            swagger(swaggerUrl, {
                authorizations: {
                    Bearer: `Bearer ${token}`
                }
            })
                .then((swaggerClient: any) => {
                    resolve(new SDK(swaggerClient, token, gateway));
                })
                .catch(reject);
        });
    }

    private static generateSecurityToken(gateway: GatewayConfig) {
        const dataToken = {
            login: 'treeGateway SDK',
            name: 'treeGateway SDK',
            roles: ['admin', 'config']
        };

        const token = jwt.sign(dataToken, gateway.admin.userService.jwtSecret, {
            expiresIn: 7200
        });
        return token;
    }

    private static getSwaggerUrl(gateway: GatewayConfig) {
        if (gateway && gateway.admin && gateway.admin.apiDocs) {
            const protocol = (gateway.admin.protocol.https ? 'https' : 'http');
            return `${protocol}://` + path.posix.join(`${getSwaggerHost(gateway)}`, gateway.admin.apiDocs.path, 'json');
        }
        throw new Error('No admin apiDocs configured. Can not access the server rest API');
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
