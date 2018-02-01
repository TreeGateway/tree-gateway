'use strict';

import { GatewayConfig } from '../config/gateway';
import * as _ from 'lodash';

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

export function castArray(obj: any, path: string) {
    if (!obj || !path) {
        return;
    }
    if (_.has(obj, path)) {
        const value = _.get(obj, path, null);
        _.set(obj, path, _.castArray(value));
    }
}
