'use strict';

import * as os from 'os';
import { GatewayConfig } from '../config/gateway';

export function getSwaggerHost(gateway: GatewayConfig, isTest?: boolean) {
    let host;
    if (gateway.admin.apiDocs.host) {
        host = gateway.admin.apiDocs.host;
    } else {
        host = isTest ? 'localhost' : os.hostname();
    }
    return host;
}
