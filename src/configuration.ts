'use strict';

import * as fs from 'fs-extra-promise';
import * as _ from 'lodash';
import * as path from 'path';
import * as YAML from 'yamljs';
import { EventEmitter } from 'events';
import { RedisConfig, ServerConfig, GatewayConfig, validateServerConfig, validateGatewayConfig } from './config/gateway';
import { AutoWired, Container, Singleton } from 'typescript-ioc';
import { checkEnvVariable } from './utils/env';
import { UserService } from './service/users';
import { MiddlewareService } from './service/middleware';
import { ApiService } from './service/api';
import { ConfigService } from './service/config';
import { GatewayService } from './service/gateway';
import { StatsHandler } from './stats/stats';

@Singleton
@AutoWired
export class Configuration extends EventEmitter {
    static gatewayConfigFile: string;
    static resetBeforeStart: boolean;

    private config: ServerConfig;
    private isLoaded: boolean;

    constructor() {
        super();
        this.loadGatewayConfig(Configuration.gatewayConfigFile || path.join(process.cwd(), 'tree-gateway.json'))
            .then(() => {
                this.isLoaded = true;
                this.emit('load', this);
            })
            .catch(err => {
                this.isLoaded = false;
                this.emit('error', err);
            });
    }

    reload(): Promise<void> {
        this.config = null;
        return new Promise<void>((resolve, reject) => {
            this.loadGatewayConfig(Configuration.gatewayConfigFile || path.join(process.cwd(), 'tree-gateway.json'))
                .then(() => {
                    this.emit('gateway-update', this.gateway);
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
        return this.isLoaded;
    }

    private loadGatewayConfig(serverConfigFile: string): Promise<void> {
        let configFileName: string = serverConfigFile;
        configFileName = this.removeExtension(_.trim(configFileName));

        if (_.startsWith(configFileName, '.')) {
            configFileName = path.join(process.cwd(), configFileName);
        }

        let config: ServerConfig = this.loadConfigObject(configFileName);
        if (process.env.NODE_ENV) {
            const envConfigFileName = (`${configFileName}-${process.env.NODE_ENV}`);
            const envConfig = this.loadConfigObject(envConfigFileName);
            if (envConfig) {
                config = <ServerConfig>_.defaultsDeep(envConfig, config);
            }
        }

        let serverConfig: ServerConfig = validateServerConfig(config);
        serverConfig = _.defaults(serverConfig, {
            rootPath: path.dirname(configFileName),
        });

        serverConfig.rootPath = <string>checkEnvVariable(serverConfig.rootPath);

        if (_.startsWith(serverConfig.rootPath, '.')) {
            serverConfig.rootPath = path.join(path.dirname(configFileName), serverConfig.rootPath);
        }

        serverConfig = _.defaults(serverConfig, {
            middlewarePath: path.join(serverConfig.rootPath, 'middleware')
        });

        serverConfig.middlewarePath = <string>checkEnvVariable(serverConfig.middlewarePath);

        if (_.startsWith(serverConfig.middlewarePath, '.')) {
            serverConfig.middlewarePath = path.join(serverConfig.rootPath, serverConfig.middlewarePath);
        }

        this.config = serverConfig;
        this.loadContainerConfigurations();
        return new Promise<void>((resolve, reject) => {
            if (this.config.gateway) {
                if (this.config.gateway.protocol.https) {
                    if (_.startsWith(this.config.gateway.protocol.https.privateKey, '.')) {
                        this.config.gateway.protocol.https.privateKey =
                            path.join(this.config.rootPath, this.config.gateway.protocol.https.privateKey);
                    }
                    if (_.startsWith(this.config.gateway.protocol.https.certificate, '.')) {
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

    private ensureLoaded() {
        if (!this.isLoaded) {
            throw new Error('Configuration not loaded. Only access configurations after the Configuration \'load\' event is fired.');
        }
    }

    private loadContainerConfigurations() {

        const RedisApiService = require('./service/redis/api').RedisApiService;
        const RedisConfigService = require('./service/redis/config').RedisConfigService;
        const RedisUserService = require('./service/redis/users').RedisUserService;
        const RedisMiddlewareService = require('./service/redis/middleware').RedisMiddlewareService;
        const RedisGatewayService = require('./service/redis/gateway').RedisGatewayService;
        const RedisStats = require('./stats/redis-stats').RedisStats;

        Container.bind(GatewayService).to(RedisGatewayService);
        Container.bind(MiddlewareService).to(RedisMiddlewareService);
        Container.bind(ApiService).to(RedisApiService);
        Container.bind(ConfigService).to(RedisConfigService);
        Container.bind(UserService).to(RedisUserService);
        Container.bind(StatsHandler).to(RedisStats);
    }

    private loadDatabaseConfig(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                if (Configuration.resetBeforeStart) {
                    console.info('reseting database');
                    const Database = require('./database').Database;
                    const database = Container.get(Database);
                    database.redisClient.flushdb()
                        .then(() => this.getConfigFromDB())
                        .then(resolve)
                        .catch(reject);
                } else {
                    this.getConfigFromDB()
                        .then(resolve)
                        .catch(reject);
                }
            }, 1);
        });
    }

    private getConfigFromDB() {
        return new Promise<void>((resolve, reject) => {
            const gatewayService: GatewayService = Container.get(GatewayService);
            gatewayService.get()
                .then(gatewayConfig => {
                    if (gatewayConfig) {
                        this.config.gateway = <GatewayConfig>_.defaultsDeep(gatewayConfig, this.config.gateway);
                        try {
                            validateGatewayConfig(this.config.gateway);
                        } catch (e) {
                            return reject(e);
                        }
                    }
                    resolve();
                })
                .catch(reject);
        });
    }

    private loadConfigObject(fileName: string): ServerConfig {
        if (fs.existsSync(`${fileName}.yml`)) {
            return YAML.load(`${fileName}.yml`);
        } else if (fs.existsSync(`${fileName}.yaml`)) {
            return YAML.load(`${fileName}.yaml`);
        } else if (fs.existsSync(`${fileName}.json`)) {
            return fs.readJSONSync(`${fileName}.json`);
        } else {
            return null;
        }
    }

    private removeExtension(fileName: string) {
        const lowerFileName = fileName.toLowerCase();
        if (lowerFileName.endsWith('.yaml') || lowerFileName.endsWith('.yml') || lowerFileName.endsWith('.json')) {
            return fileName.substring(0, fileName.lastIndexOf('.'));
        }
        return fileName;
    }
}
