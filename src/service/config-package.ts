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
    set(config: ConfigPackage): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (config.middlewares) {
                Promise.all(config.middlewares.map(mid =>
                    this.middlewareService.save(mid.middleware, mid.id || mid.name, new Buffer(mid.content))))
                    .then(() => this.setApisAndGateway(config))
                    .then(resolve)
                    .catch(reject);
            } else {
                this.setApisAndGateway(config)
                    .then(resolve)
                    .catch(reject);
            }
        });
    }

    /**
     * Export all gateway configurations to a new config package.
     * @return The generated config package
     */
    get(): Promise<ConfigPackage> {
        return new Promise<ConfigPackage>((resolve, reject) => {
            const result: ConfigPackage = {};
            Promise.all([this.apiService.list(), this.gatewayService.get(), this.getMiddlewares()])
                .then(data => {
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
                    return resolve(result);
                })
                .catch(reject);
        });
    }

    private getMiddlewares(): Promise<Array<MiddlewareConfig>> {
        return new Promise<Array<MiddlewareConfig>>((resolve, reject) => {
            Promise.all([
                this.middlewareService.list('filter'),
                this.middlewareService.list('interceptor/request'),
                this.middlewareService.list('interceptor/response'),
                this.middlewareService.list('authentication/strategy'),
                this.middlewareService.list('authentication/verify'),
                this.middlewareService.list('throttling/keyGenerators'),
                this.middlewareService.list('throttling/handlers'),
                this.middlewareService.list('throttling/skip'),
                this.middlewareService.list('circuitbreaker'),
                this.middlewareService.list('cors/origin'),
                this.middlewareService.list('proxy/router'),
                this.middlewareService.list('servicediscovery'),
                this.middlewareService.list('servicediscovery/provider'),
                this.middlewareService.list('errorhandler'),
                this.middlewareService.list('request/logger')
            ]).then(allMiddlewares => {
                return Promise.all([
                    this.getMiddlewaresByType('filter', allMiddlewares[0]),
                    this.getMiddlewaresByType('interceptor/request', allMiddlewares[1]),
                    this.getMiddlewaresByType('interceptor/response', allMiddlewares[2]),
                    this.getMiddlewaresByType('authentication/strategy', allMiddlewares[3]),
                    this.getMiddlewaresByType('authentication/verify', allMiddlewares[4]),
                    this.getMiddlewaresByType('throttling/keyGenerators', allMiddlewares[5]),
                    this.getMiddlewaresByType('throttling/handlers', allMiddlewares[6]),
                    this.getMiddlewaresByType('throttling/skip', allMiddlewares[7]),
                    this.getMiddlewaresByType('circuitbreaker', allMiddlewares[8]),
                    this.getMiddlewaresByType('cors/origin', allMiddlewares[9]),
                    this.getMiddlewaresByType('proxy/router', allMiddlewares[10]),
                    this.getMiddlewaresByType('servicediscovery', allMiddlewares[11]),
                    this.getMiddlewaresByType('servicediscovery/provider', allMiddlewares[12]),
                    this.getMiddlewaresByType('errorhandler', allMiddlewares[13]),
                    this.getMiddlewaresByType('request/logger', allMiddlewares[14])
                ]);
            }).then((all) => {
                const result: Array<MiddlewareConfig> = [];
                all.forEach(middlewares => {
                    middlewares.forEach(middleware => {
                        result.push(middleware);
                    });
                });
                resolve(result);
            }).catch(reject);
        });
    }

    private getMiddlewaresByType(middleware: string, names: Array<string>): Promise<Array<MiddlewareConfig>> {
        return new Promise<Array<MiddlewareConfig>>((resolve, reject) => {
            if (names && names.length) {
                const promises = names.map(name => new Promise<MiddlewareConfig>((res, rej) => {
                    this.middlewareService.read(middleware, name)
                        .then(content => res({ middleware: middleware, id: name, content: content.toString() }))
                        .catch(rej);
                }));
                Promise.all(promises).then(resolve).catch(reject);
            } else {
                resolve([]);
            }
        });
    }

    private setApisAndGateway(config: ConfigPackage): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let promises: Array<Promise<void>>;
            if (config.apis) {
                promises = config.apis.map(api => this.apiService.update(api, true));
            } else {
                promises = [];
            }
            if (config.gateway) {
                promises.push(this.gatewayService.save(config.gateway));
            }
            Promise.all(promises)
                .then(() => resolve())
                .catch(reject);
        });
    }
}
