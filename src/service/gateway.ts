'use strict';

import { GatewayConfig } from '../config/gateway';

export abstract class GatewayService {
    abstract remove(): Promise<void>;
    abstract save(content: GatewayConfig): Promise<void>;
    abstract read(): Promise<GatewayConfig>;
    abstract get(): Promise<GatewayConfig>;
}
