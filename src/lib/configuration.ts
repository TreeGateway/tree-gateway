"use strict";

import * as fs from "fs-extra-promise";
import * as _ from "lodash";
import * as path from "path";

import {GatewayConfig, validateGatewayConfig} from "./config/gateway";
import {StatsConfig} from "./config/stats";
import {AutoWired, Container, Singleton} from "typescript-ioc";
// import {ConfigService} from "./service/api";
// import {UserService} from "./service/users";
// import {RedisConfigService} from "./service/redis";

@Singleton
@AutoWired
export class Configuration {
    private config: GatewayConfig;

    get gateway() : GatewayConfig {
        if (!this.config) {
            throw new Error(`Configuration not loaded. Call Configuration.load() first.`)
        }
        return this.config;
    }
    
    load(gatewayConfigFile: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.loadGatewayConfig(gatewayConfigFile)
                .then(() => this.loadContainerConfigurations())
                .then(resolve)
                .catch(reject);
        });
    }

    private loadContainerConfigurations(): Promise<void> {
        let self = this;
        return new Promise<void>((resolve, reject) => {
            const ConfigService = require("./service/api").ConfigService;
            const UserService = require("./service/users").UserService;
            const RedisConfigService = require("./service/redis").RedisConfigService;

            Container.bind(ConfigService).to(RedisConfigService);
            if (self.config.admin && self.config.admin.users &&  self.config.admin.users.userService) {
                let UserServiceClass = require(self.config.admin.users.userService);
                Container.bind(UserService).provider({
                    get: () => new UserServiceClass()
                });
            }
            resolve();
        });
    }

    private loadGatewayConfig(gatewayConfigFile: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let configFileName: string = gatewayConfigFile
            try {
                configFileName = _.trim(configFileName);

                if (_.startsWith(configFileName, ".")) {
                    configFileName = path.join(process.cwd(), configFileName);
                }

                fs.readJsonAsync(configFileName)
                    .then((config:GatewayConfig) => {
                        if (process.env.NODE_ENV) {
                            let envConfigFileName = configFileName.replace(`.json`, `-${process.env.NODE_ENV}.json`);
                            if (fs.existsSync(envConfigFileName)) {
                                let envConfig = fs.readJsonSync(envConfigFileName);
                                config = <GatewayConfig>_.defaultsDeep(envConfig, config);
                            }                
                        }
                        return validateGatewayConfig(config);
                    })
                    .then((gatewayConfig:GatewayConfig) => {
                        gatewayConfig = _.defaults(gatewayConfig, {
                            rootPath : path.dirname(configFileName),
                        });

                        if (_.startsWith(gatewayConfig.rootPath, ".")) {
                            gatewayConfig.rootPath = path.join(path.dirname(configFileName), gatewayConfig.rootPath);
                        }

                        gatewayConfig = _.defaults(gatewayConfig, {
                            middlewarePath : path.join(gatewayConfig.rootPath, "middleware")
                        });

                        if (gatewayConfig.admin && gatewayConfig.admin.users.userService && _.startsWith(gatewayConfig.admin.users.userService, ".")) {
                            gatewayConfig.admin.users.userService = path.join(gatewayConfig.rootPath, gatewayConfig.admin.users.userService);                
                        }

                        if (_.startsWith(gatewayConfig.middlewarePath, ".")) {
                            gatewayConfig.middlewarePath = path.join(gatewayConfig.rootPath, gatewayConfig.middlewarePath);                
                        }

                        if (gatewayConfig.protocol.https) {
                            if (_.startsWith(gatewayConfig.protocol.https.privateKey, ".")) {
                                gatewayConfig.protocol.https.privateKey = path.join(gatewayConfig.rootPath, gatewayConfig.protocol.https.privateKey);                
                            }
                            if (_.startsWith(gatewayConfig.protocol.https.certificate, ".")) {
                                gatewayConfig.protocol.https.certificate = path.join(gatewayConfig.rootPath, gatewayConfig.protocol.https.certificate);                
                            }
                        }
                        this.config = gatewayConfig;
                        resolve();
                    })
                    .catch(err => reject(err));
            } catch (error) {
                reject(new Error(`Error reading ${configFileName} config file: ${error}`));
            }
        });
    }
}


