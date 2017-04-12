"use strict";

import * as fs from "fs-extra-promise";
import * as _ from "lodash";
import * as path from "path";
import {EventEmitter} from "events";
import {RedisConfig, ServerConfig, GatewayConfig, validateGatewayConfig, validateServerConfig} from "./config/gateway";
import {AutoWired, Container, Singleton} from "typescript-ioc";
import {checkEnvVariable} from "./utils/env";


@Singleton
@AutoWired
export class Configuration extends EventEmitter {
    static gatewayConfigFile: string;
    
    private config: ServerConfig;
    private _loaded: boolean;

    constructor()
    {
        super();
        this.loadGatewayConfig(Configuration.gatewayConfigFile || path.join(process.cwd(), 'tree-gateway.json'))
            .then(() => {
                this.loadContainerConfigurations();
                this._loaded = true;
                this.emit("load", this);
            });
    }

    reload(): Promise<void> {
        this.config = null;
        return new Promise<void>((resolve, reject) => {
            this.loadGatewayConfig(Configuration.gatewayConfigFile || path.join(process.cwd(), 'tree-gateway.json'))
                .then(() => {
                    this.emit("gateway-update", this.gateway);
                    resolve();
                }).catch(reject);
        }); 
    }

    get gateway(): GatewayConfig {
        this.ensureLoaded();
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

    get loaded(): boolean {
        return this._loaded;
    }

    private ensureLoaded() {
        if (!this._loaded) {
            throw new Error('Configuration not loaded. Only access configurations after the Configuratio "load" event is fired.')
        }
    }

    private loadContainerConfigurations() {
        const ConfigService = require("./service/api").ConfigService;
        const RedisConfigService = require("./service/redis").RedisConfigService;
        const StatsHandler = require("./stats/stats").StatsHandler;
        const RedisStats = require("./stats/redis-stats").RedisStats;

        Container.bind(ConfigService).to(RedisConfigService);
        Container.bind(StatsHandler).to(RedisStats);
    }

    private loadGatewayConfig(serverConfigFile: string): Promise<void> {
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

        serverConfig.rootPath = checkEnvVariable(serverConfig.rootPath);

        if (_.startsWith(serverConfig.rootPath, ".")) {
            serverConfig.rootPath = path.join(path.dirname(configFileName), serverConfig.rootPath);
        }

        serverConfig = _.defaults(serverConfig, {
            middlewarePath : path.join(serverConfig.rootPath, "middleware")
        });

        serverConfig.middlewarePath = checkEnvVariable(serverConfig.middlewarePath);

        if (_.startsWith(serverConfig.middlewarePath, ".")) {
            serverConfig.middlewarePath = path.join(serverConfig.rootPath, serverConfig.middlewarePath);                
        }

        this.config = serverConfig;
        return new Promise<void>((resolve, reject) => {
            if (this.config.gateway) {
                if (this.config.gateway.protocol.https) {
                    if (_.startsWith(this.config.gateway.protocol.https.privateKey, ".")) {
                        this.config.gateway.protocol.https.privateKey = 
                                path.join(this.config.rootPath, this.config.gateway.protocol.https.privateKey);                
                    }
                    if (_.startsWith(this.config.gateway.protocol.https.certificate, ".")) {
                        this.config.gateway.protocol.https.certificate = 
                                path.join(this.config.rootPath, this.config.gateway.protocol.https.certificate);                
                    }
                }
            }
            this.loadDatabaseConfig()
                .then(resolve)
                .catch(reject);
        });
    }

    private loadDatabaseConfig(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let self = this;
            setTimeout(() => {
                const Database = require("./database").Database;
                const database = Container.get(Database);
                
                database.redisClient.get('{config}:gateway')
                    .then((config: string) => {
                        if (config) {
                            const configGateway: GatewayConfig = JSON.parse(config);                            
                            self.config.gateway = <GatewayConfig>_.defaultsDeep(configGateway, self.config.gateway);
                        }
                        resolve();                    
                    }).catch(reject);
            }, 1);
        });
    }
}


