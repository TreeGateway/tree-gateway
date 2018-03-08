'use strict';

import { Logger } from '../logger';
import { Inject, Singleton } from 'typescript-ioc';
import { GatewayConfig } from '../config/gateway';
import { MiddlewareConfig } from '../config/middleware';
import { MiddlewareLoader } from '../utils/middleware-loader';

@Singleton
export class ServiceDiscovery {
    @Inject private logger: Logger;
    @Inject private middlewareLoader: MiddlewareLoader;

    private loadedClients: Map<string, any> = new Map<string, any>();

    async loadServiceDiscoveryProviders(gatewayConfig: GatewayConfig): Promise<void> {
        if (!gatewayConfig.serviceDiscovery || !gatewayConfig.serviceDiscovery.provider || !gatewayConfig.serviceDiscovery.provider.length) {
            return;
        }
        const promises = gatewayConfig.serviceDiscovery.provider.map(provider => {
            return new Promise<void>((resolve, reject) => {
                const middlewareId = this.middlewareLoader.getId(provider);
                try {
                    const middleware = this.middlewareLoader.loadMiddleware('servicediscovery/provider', provider);
                    Promise.resolve(middleware())
                        .then((serviceDiscovery: any) => {
                            this.loadedClients.set(middlewareId, serviceDiscovery);
                            this.logger.info(`Service Discovery provider ${middlewareId} initialized.`);
                            resolve();
                        })
                        .catch(error => {
                            reject(new Error(`Error loading service discovery provider ${middlewareId}. Error: ${error.message}`));
                        });
                } catch (error) {
                    reject(new Error(`Error loading service discovery provider ${middlewareId}. Error: ${error.message}`));
                }
            });
        });
        await Promise.all(promises);
    }

    loadServiceDiscovery(middlewareConfig: MiddlewareConfig, ssl?: boolean) {
        const provider = this.middlewareLoader.getId(middlewareConfig);
        const serviceDiscovery = this.loadedClients.get(provider);
        if (serviceDiscovery) {
            if (this.logger.isDebugEnabled()) {
                this.logger.debug(`Loading service discovery middleware ${provider}.`);
            }
            middlewareConfig.options = middlewareConfig.options || {};
            middlewareConfig.options.clientAgent = serviceDiscovery;
            if (ssl) {
                middlewareConfig.options.ssl = ssl;
            }
            return this.middlewareLoader.loadMiddleware('servicediscovery', middlewareConfig);
        } else {
            throw new Error(`Error loading service discovery. Provider ${provider} does not exists. Ensure you have configured a provider.`);
        }
    }
}
