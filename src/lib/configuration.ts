"use strict";

import * as fs from "fs-extra-promise";
import * as _ from "lodash";
import * as path from "path";

import {RedisConfig, ServerConfig, GatewayConfig, validateGatewayConfig, validateServerConfig} from "./config/gateway";
import {AutoWired, Container, Singleton} from "typescript-ioc";

@Singleton
@AutoWired
export class Configuration {
    private config: ServerConfig;
    static gatewayConfigFile: string;

    constructor()
    {
        this.loadGatewayConfig(Configuration.gatewayConfigFile || path.join(process.cwd(), 'tree-gateway.json'))
        this.loadContainerConfigurations()
    }

    get gateway(): GatewayConfig {
        return this.config.gateway;
    }

    get rootPath(): string {
        return this.config.rootPath;
    }
    
    get middlewarePath(): string {
        return this.config.middlewarePath;
    }

    get database(): RedisConfig {
        return this.config.database;
    }

    private loadContainerConfigurations() {
        const ConfigService = require("./service/api").ConfigService;
        const RedisConfigService = require("./service/redis").RedisConfigService;
        const StatsHandler = require("./stats/stats").StatsHandler;
        const RedisStats = require("./stats/redis-stats").RedisStats;

        Container.bind(ConfigService).to(RedisConfigService);
        Container.bind(StatsHandler).to(RedisStats);
    }

    private loadGatewayConfig(serverConfigFile: string) {
        let configFileName: string = serverConfigFile
        configFileName = _.trim(configFileName);

        if (_.startsWith(configFileName, ".")) {
            configFileName = path.join(process.cwd(), configFileName);
        }

        let config:ServerConfig = fs.readJsonSync(configFileName)
        if (process.env.NODE_ENV) {
            let envConfigFileName = configFileName.replace(`.json`, `-${process.env.NODE_ENV}.json`);
            if (fs.existsSync(envConfigFileName)) {
                let envConfig = fs.readJsonSync(envConfigFileName);
                config = <ServerConfig>_.defaultsDeep(envConfig, config);
            }                
        }

        let serverConfig:ServerConfig = validateServerConfig(config);
        serverConfig = _.defaults(serverConfig, {
            rootPath : path.dirname(configFileName),
        });

        if (_.startsWith(serverConfig.rootPath, ".")) {
            serverConfig.rootPath = path.join(path.dirname(configFileName), serverConfig.rootPath);
        }

        serverConfig = _.defaults(serverConfig, {
            middlewarePath : path.join(serverConfig.rootPath, "middleware")
        });

        if (_.startsWith(serverConfig.middlewarePath, ".")) {
            serverConfig.middlewarePath = path.join(serverConfig.rootPath, serverConfig.middlewarePath);                
        }

        let gatewayConfig = serverConfig.gateway;
        if (gatewayConfig) {
            if (gatewayConfig.protocol.https) {
                if (_.startsWith(gatewayConfig.protocol.https.privateKey, ".")) {
                    gatewayConfig.protocol.https.privateKey = path.join(serverConfig.rootPath, gatewayConfig.protocol.https.privateKey);                
                }
                if (_.startsWith(gatewayConfig.protocol.https.certificate, ".")) {
                    gatewayConfig.protocol.https.certificate = path.join(serverConfig.rootPath, gatewayConfig.protocol.https.certificate);                
                }
            }
        }
        this.config = serverConfig;
    }
}


