'use strict';

import { GatewayConfig } from '../config/gateway';

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
