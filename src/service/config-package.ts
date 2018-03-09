'use strict';

import { ConfigPackage, MiddlewareConfig } from '../config/config-package';
import { Provides, AutoWired, Singleton, Inject } from 'typescript-ioc';
import { ApiService } from './api';
import { GatewayService } from './gateway';
import { MiddlewareService } from './middleware';

export abstract class ConfigPackageService {
    abstract set(config: ConfigPackage): Promise<void>;
    abstract get(): Promise<ConfigPackage>;
}

@AutoWired
@Singleton
@Provides(ConfigPackageService)
export class ConfigPackageServiceImpl implements ConfigPackageService {
    @Inject private apiService: ApiService;
    @Inject private gatewayService: GatewayService;
    @Inject private middlewareService: MiddlewareService;

    /**
     * Apply a config package to this Gateway
     * @param config The config package to apply
     */
    async set(config: ConfigPackage): Promise<void> {
        if (config.middlewares) {
            await Promise.all(config.middlewares.map(mid =>
                this.middlewareService.update(mid.middleware, mid.id || mid.name, new Buffer(mid.content), true))
            );
            await this.setApisAndGateway(config);
        } else {
            await this.setApisAndGateway(config);
        }
    }

    /**
     * Export all gateway configurations to a new config package.
     * @return The generated config package
     */
    async get(): Promise<ConfigPackage> {
        const result: ConfigPackage = {};
        const data = await Promise.all([this.apiService.list(), this.gatewayService.get(), this.getMiddlewares()]);
        if (data && data.length) {
            if (data[0]) {
                result.apis = data[0];
            }
            if (data.length > 1 && data[1]) {
                result.gateway = data[1];
            }
            if (data.length > 2 && data[2]) {
                result.middlewares = data[2];
            }
        }
        return result;
    }

    private async getMiddlewares(): Promise<Array<MiddlewareConfig>> {
        const allMiddlewares = await Promise.all([
            this.middlewareService.list('filter'),
            this.middlewareService.list('interceptor/request'),
            this.middlewareService.list('interceptor/response'),
            this.middlewareService.list('authentication/strategy'),
            this.middlewareService.list('authentication/verify'),
            this.middlewareService.list('throttling/keyGenerator'),
            this.middlewareService.list('throttling/handler'),
            this.middlewareService.list('throttling/skip'),
            this.middlewareService.list('circuitbreaker'),
            this.middlewareService.list('cors/origin'),
            this.middlewareService.list('proxy/router'),
            this.middlewareService.list('servicediscovery'),
            this.middlewareService.list('servicediscovery/provider'),
            this.middlewareService.list('errorhandler'),
            this.middlewareService.list('request/logger')
        ]);
        const all = await Promise.all([
            this.getMiddlewaresByType('filter', allMiddlewares[0]),
            this.getMiddlewaresByType('interceptor/request', allMiddlewares[1]),
            this.getMiddlewaresByType('interceptor/response', allMiddlewares[2]),
            this.getMiddlewaresByType('authentication/strategy', allMiddlewares[3]),
            this.getMiddlewaresByType('authentication/verify', allMiddlewares[4]),
            this.getMiddlewaresByType('throttling/keyGenerator', allMiddlewares[5]),
            this.getMiddlewaresByType('throttling/handler', allMiddlewares[6]),
            this.getMiddlewaresByType('throttling/skip', allMiddlewares[7]),
            this.getMiddlewaresByType('circuitbreaker', allMiddlewares[8]),
            this.getMiddlewaresByType('cors/origin', allMiddlewares[9]),
            this.getMiddlewaresByType('proxy/router', allMiddlewares[10]),
            this.getMiddlewaresByType('servicediscovery', allMiddlewares[11]),
            this.getMiddlewaresByType('servicediscovery/provider', allMiddlewares[12]),
            this.getMiddlewaresByType('errorhandler', allMiddlewares[13]),
            this.getMiddlewaresByType('request/logger', allMiddlewares[14])
        ]);
        const result: Array<MiddlewareConfig> = [];
        all.forEach(middlewares => {
            middlewares.forEach(middleware => {
                result.push(middleware);
            });
        });
        return result;
    }

    private async getMiddlewaresByType(middleware: string, names: Array<string>): Promise<Array<MiddlewareConfig>> {
        if (names && names.length) {
            const promises = names.map(name => new Promise<MiddlewareConfig>((res, rej) => {
                this.middlewareService.read(middleware, name)
                    .then(content => res({ middleware: middleware, id: name, content: content.toString() }))
                    .catch(rej);
            }));
            return await Promise.all(promises);
        } else {
            return [];
        }
    }

    private async setApisAndGateway(config: ConfigPackage): Promise<void> {
        let promises: Array<Promise<void>>;
        if (config.apis) {
            promises = config.apis.map(api => this.apiService.update(api, true));
        } else {
            promises = [];
        }
        if (config.gateway) {
            promises.push(this.gatewayService.save(config.gateway));
        }
        await Promise.all(promises);
    }
}
