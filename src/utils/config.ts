'use strict';

import { GatewayConfig } from '../config/gateway';
import * as _ from 'lodash';
import * as path from 'path';
import * as jwt from 'jsonwebtoken';

export function getSwaggerHost(gateway: GatewayConfig) {
    let host;
    if (gateway.admin.apiDocs.host) {
        host = gateway.admin.apiDocs.host;
    } else {
        host = (gateway.admin.protocol.https ?
            `localhost:${gateway.admin.protocol.https.listenPort}` :
            `localhost:${gateway.admin.protocol.http.listenPort}`);
    }
    return host;
}

export function getSwaggerUrl(gateway: GatewayConfig) {
    if (gateway && gateway.admin && gateway.admin.apiDocs) {
        const protocol = (gateway.admin.protocol.https ? 'https' : 'http');
        return `${protocol}://` + path.posix.join(`${getSwaggerHost(gateway)}`, gateway.admin.apiDocs.path, 'json');
    }
    throw new Error('No admin apiDocs configured. Can not access the server rest API');
}

export function generateSecurityToken(gateway: GatewayConfig) {
    const dataToken = {
        login: 'treeGateway CLI',
        name: 'treeGateway CLI',
        roles: ['admin', 'config']
    };

    const token = jwt.sign(dataToken, gateway.admin.userService.jwtSecret, {
        expiresIn: 7200
    });
    return token;
}

export function castArray(obj: any, objPath: string) {
    if (!obj || !objPath) {
        return;
    }
    if (_.has(obj, objPath)) {
        const value = _.get(obj, objPath, null);
        _.set(obj, objPath, _.castArray(value));
    }
}
