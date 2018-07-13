'use strict';

import { Inject } from 'typescript-ioc';
import { DELETE, GET, Path, PUT } from 'typescript-rest';
import * as swagger from 'typescript-rest-swagger';
import { GatewayConfig, validateGatewayConfig } from '../../config/gateway';
import { GatewayService } from '../../service/gateway';

@Path('gateway')
@swagger.Tags('Gateway')
@swagger.Security('Bearer')
export class GatewayRest {
    @Inject private service: GatewayService;

    @PUT
    public async updateConfig(config: GatewayConfig): Promise<void> {
        await validateGatewayConfig(config);
        await this.service.save(config);
    }

    @DELETE
    public async removeConfig(): Promise<void> {
        await this.service.remove();
    }

    @GET
    public async getConfig(): Promise<GatewayConfig> {
        return await this.service.read();
    }
}
