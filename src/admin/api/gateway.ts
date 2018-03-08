'use strict';

import { Path, GET, DELETE, PUT } from 'typescript-rest';
import { GatewayConfig, validateGatewayConfig } from '../../config/gateway';
import { GatewayService } from '../../service/gateway';
import { Inject } from 'typescript-ioc';
import * as swagger from 'typescript-rest-swagger';

@Path('gateway')
@swagger.Tags('Gateway')
@swagger.Security('Bearer')
export class GatewayRest {
    @Inject private service: GatewayService;

    @PUT
    async updateConfig(config: GatewayConfig): Promise<void> {
        await validateGatewayConfig(config);
        await this.service.save(config);
    }

    @DELETE
    async removeConfig(): Promise<void> {
        await this.service.remove();
    }

    @GET
    async getConfig(): Promise<GatewayConfig> {
        return await this.service.read();
    }
}
