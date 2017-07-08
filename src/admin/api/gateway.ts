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
    updateConfig(config: GatewayConfig): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            validateGatewayConfig(config);
            this.service.save(config)
                .then(resolve)
                .catch(reject);
        });
    }

    @DELETE
    removeConfig(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.service.remove()
                .then(resolve)
                .catch(reject);
        });
    }

    @GET
    getConfig(): Promise<GatewayConfig> {
        return new Promise((resolve, reject) => {
            this.service.read()
                .then(resolve)
                .catch(reject);
        });
    }
}
