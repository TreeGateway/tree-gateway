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

    loadServiceDiscoveryProviders(gatewayConfig: GatewayConfig) {
        if (!gatewayConfig.serviceDiscovery || !gatewayConfig.serviceDiscovery.provider || !gatewayConfig.serviceDiscovery.provider.length) {
            return Promise.resolve();
        }
        const promises = gatewayConfig.serviceDiscovery.provider.map(provider => {
            return new Promise<void>((resolve, reject) => {
                const middleware = this.middlewareLoader.loadMiddleware('servicediscovery/provider', provider);
                Promise.resolve(middleware())
                    .then((serviceDiscovery: any) => {
                        this.loadedClients.set(provider.name, serviceDiscovery);
                        this.logger.info(`Service Discovery provider ${provider.name} initialized.`);
                        resolve();
                    })
                    .catch(error => {
                        reject(new Error(`Error loading service discovery provider ${provider.name}. Error: ${error.message}`));
                    });
            });
        });
        return new Promise<void>((resolve, reject) => {
            Promise.all(promises).then(() => resolve()).catch(reject);
        });
    }

    loadServiceDiscovery(middlewareConfig: MiddlewareConfig, ssl?: boolean) {
        const provider = middlewareConfig.name;
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
