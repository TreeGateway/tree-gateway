"use strict";

import * as fs from "fs-extra-promise";
import * as _ from "lodash";
import * as path from "path";

import {GatewayConfig, validateGatewayConfig} from "./config/gateway";
import {AutoWired, Container, Singleton} from "typescript-ioc";

@Singleton
@AutoWired
export class Configuration {
    private config: GatewayConfig;
    static gatewayConfigFile: string;

    constructor()
    {
        this.loadGatewayConfig(Configuration.gatewayConfigFile || path.join(process.cwd(), 'tree-gateway.json'))
        this.loadContainerConfigurations()
    }

    get gateway() : GatewayConfig {
        return this.config;
    }
    
    private loadContainerConfigurations() {
        const ConfigService = require("./service/api").ConfigService;
        const UserService = require("./service/users").UserService;
        const RedisConfigService = require("./service/redis").RedisConfigService;
        const StatsHandler = require("./stats/stats").StatsHandler;
        const RedisStats = require("./stats/redis-stats").RedisStats;

        Container.bind(ConfigService).to(RedisConfigService);
        Container.bind(StatsHandler).to(RedisStats);
        if (this.config.admin && this.config.admin.users &&  this.config.admin.users.userService) {
            let UserServiceClass = require(this.config.admin.users.userService);
            Container.bind(UserService).provider({
                get: () => new UserServiceClass()
            });
        }
    }

    private loadGatewayConfig(gatewayConfigFile: string) {
        let configFileName: string = gatewayConfigFile
        configFileName = _.trim(configFileName);

        if (_.startsWith(configFileName, ".")) {
            configFileName = path.join(process.cwd(), configFileName);
        }

        let config:GatewayConfig = fs.readJsonSync(configFileName)
        if (process.env.NODE_ENV) {
            let envConfigFileName = configFileName.replace(`.json`, `-${process.env.NODE_ENV}.json`);
            if (fs.existsSync(envConfigFileName)) {
                let envConfig = fs.readJsonSync(envConfigFileName);
                config = <GatewayConfig>_.defaultsDeep(envConfig, config);
            }                
        }

        let gatewayConfig:GatewayConfig = validateGatewayConfig(config);
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
    }
}


