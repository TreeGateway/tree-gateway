'use strict';

import { GatewayConfig } from '../config/gateway';

export abstract class GatewayService {
    public abstract remove(): Promise<void>;
    public abstract save(content: GatewayConfig): Promise<void>;
    public abstract read(): Promise<GatewayConfig>;
    public abstract get(): Promise<GatewayConfig>;
    public abstract registerGatewayVersion(): Promise<void>;
}
