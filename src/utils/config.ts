'use strict';

import * as os from 'os';
import { GatewayConfig } from '../config/gateway';

export function getSwaggerHost(gateway: GatewayConfig, isTest?: boolean) {
    let host;
    if (gateway.admin.apiDocs.host) {
        host = gateway.admin.apiDocs.host;
    } else {
        host = (gateway.admin.protocol.https ?
            `${isTest ? 'localhost' : os.hostname()}:${gateway.admin.protocol.https.listenPort}` :
            `${isTest ? 'localhost' : os.hostname()}:${gateway.admin.protocol.http.listenPort}`);
    }
    return host;
}
