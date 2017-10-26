'use strict';

import { ConfigPackage } from '../config/config-package';
import { Provides, AutoWired, Singleton, Inject } from 'typescript-ioc';
import { ApiService } from './api';
import { GatewayService } from './gateway';

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

    /**
     * Apply a config package to this Gateway
     * @param config The config package to apply
     */
    set(config: ConfigPackage): Promise<void> {
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

    /**
     * Export all gateway configurations to a new config package.
     * @return The generated config package
     */
    get(): Promise<ConfigPackage> {
        return new Promise<ConfigPackage>((resolve, reject) => {
            const result: ConfigPackage = {};
            Promise.all([this.apiService.list(), this.gatewayService.get()])
                .then(data => {
                    result.apis = data[0];
                    result.gateway = data[1];
                    return resolve(result);
                })
                .catch(reject);
        });
    }
}
