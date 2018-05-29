'use strict';

import * as fs from 'fs-extra-promise';
import * as _ from 'lodash';
import * as path from 'path';
import * as YAML from 'yamljs';
import * as uuid from 'uuid';
import { EventEmitter } from 'events';
import { ServerConfig, GatewayConfig, validateServerConfig, validateGatewayConfig } from './config/gateway';
import { DatabaseConfig } from './config/database';
import { AutoWired, Container, Singleton } from 'typescript-ioc';
import { checkEnvVariable } from './utils/env';
import { UserService } from './service/users';
import { MiddlewareService } from './service/middleware';
import { ApiService } from './service/api';
import { ConfigService } from './service/config';
import { GatewayService } from './service/gateway';
import { PluginsDataService } from './service/plugin-data';
import { castArray } from './utils/config';
import * as inquirer from 'inquirer';
import chalk from 'chalk';

_.mixin(require('lodash-deep'));

@Singleton
@AutoWired
export class Configuration extends EventEmitter {
    static gatewayConfigFile: string;
    static resetBeforeStart: boolean;
    static instances: number;

    private config: ServerConfig;
    private isLoaded: boolean = false;

    constructor() {
        super();
        this.load();
    }

    async load() {
        if (!this.isLoaded) {
            try {
                await this.loadGatewayConfig(Configuration.gatewayConfigFile || path.join(process.cwd(), 'tree-gateway.json'));
                this.isLoaded = true;
                this.emit('load', this);
            } catch (err) {
                this.isLoaded = false;
                this.emit('error', err);
            }
        }
    }

    async reload(): Promise<void> {
        this.config = null;
        await this.loadGatewayConfig(Configuration.gatewayConfigFile || path.join(process.cwd(), 'tree-gateway.json'));
        this.emit('gateway-update', this.gateway);
        return;
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

    get database(): DatabaseConfig {
        return this.config.database;
    }

    get loaded(): boolean {
        return this.isLoaded;
    }

    private async loadGatewayConfig(serverConfigFile: string): Promise<void> {
        let configFileName: string = serverConfigFile;
        configFileName = this.removeExtension(_.trim(configFileName));

        if (_.startsWith(configFileName, '.')) {
            configFileName = path.join(process.cwd(), configFileName);
        }
        const config = await this.loadServerConfig(configFileName);

        let serverConfig: ServerConfig = await validateServerConfig(config);
        serverConfig = _.defaults(serverConfig, {
            rootPath: path.dirname(configFileName),
        });

        if (_.startsWith(serverConfig.rootPath, '.')) {
            serverConfig.rootPath = path.join(path.dirname(configFileName), serverConfig.rootPath);
        }

        serverConfig = _.defaults(serverConfig, {
            middlewarePath: path.join(serverConfig.rootPath, 'middleware')
        });

        if (_.startsWith(serverConfig.middlewarePath, '.')) {
            serverConfig.middlewarePath = path.join(serverConfig.rootPath, serverConfig.middlewarePath);
        }

        serverConfig = this.config = (<any>_).deepMapValues(serverConfig, (value: string) => {
            return checkEnvVariable(value);
        });

        this.config = serverConfig;
        this.castArrays(this.config);
        this.loadContainerConfigurations();

        await this.loadDatabaseConfig();
        if (this.config.gateway && this.config.gateway.protocol) {
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
        return;
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
        const RedisPluginsDataService = require('./service/redis/plugin-data').RedisPluginsDataService;

        Container.bind(GatewayService).to(RedisGatewayService);
        Container.bind(MiddlewareService).to(RedisMiddlewareService);
        Container.bind(ApiService).to(RedisApiService);
        Container.bind(ConfigService).to(RedisConfigService);
        Container.bind(UserService).to(RedisUserService);
        Container.bind(PluginsDataService).to(RedisPluginsDataService);
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

    private async getConfigFromDB() {
        const gatewayService: GatewayService = Container.get(GatewayService);
        const gatewayConfig = await gatewayService.get();
        if (gatewayConfig) {
            this.config.gateway = <GatewayConfig>_.defaultsDeep(gatewayConfig, this.config.gateway);
            await validateGatewayConfig(this.config.gateway);
            if (!this.config.gateway.protocol) {
                throw new Error('GatewayConfig protocol is required.');
            }
        } else if (!this.config.gateway) {
            this.config.gateway = this.loadDefaultGatewayConfig();
            await gatewayService.save(this.config.gateway);
            await gatewayService.registerGatewayVersion();
        }
        return;
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

    private async loadServerConfig(configFileName: string): Promise<ServerConfig>  {
        let config: ServerConfig = this.loadConfigObject(configFileName);
        if (process.env.NODE_ENV) {
            const envConfigFileName = (`${configFileName}-${process.env.NODE_ENV}`);
            const envConfig = this.loadConfigObject(envConfigFileName);
            if (envConfig) {
                config = <ServerConfig>_.defaultsDeep(envConfig, config);
            }
        }
        if (!config) {
            config = await this.loadDefaultServerConfig();
        }
        return config;
    }

    private async loadDefaultServerConfig(): Promise<ServerConfig> {
        const filePath = path.join(process.cwd(), 'tree-gateway.yaml');
        console.info(chalk.yellowBright(`No server configuration file was found. Creating a configuration file and saving it on '${filePath}'`));
        const config: ServerConfig = YAML.load(require.resolve('./tree-gateway-server-default.yaml'));

        const answers = await this.askRedisOptions();
        this.createRedisConfiguration(config, answers);
        await fs.writeFile(filePath, YAML.stringify(config, 15));
        return config;
    }

    private askRedisOptions() {
        return inquirer.prompt([
            {
                choices: ['Cluster', 'Standalone'],
                default: 'Standalone',
                filter: function(val) {
                  return val.toLowerCase();
                },
                message: 'Choose the redis topology:',
                name: 'connectionType',
                type: 'list'
            },
            {
                default: 'localhost',
                message: 'Redis host:',
                name: 'host',
                type: 'input'
            },
            {
                default: '6379',
                message: 'Redis port:',
                name: 'port',
                type: 'input',
                validate: function(val) {
                    const valid = val === '' || val.match(/^[0-9]+$/) !== null;
                    return valid || 'Please enter a number';
                }
            },
            {
                message: 'Redis DB number (Optional):',
                name: 'db',
                type: 'input',
                validate: function(val) {
                    const valid = val === '' || val.match(/^[0-9]+$/) !== null;
                    return valid || 'Please enter a number';
                }
            },
            {
                message: 'Redis Password (Optional):',
                name: 'password',
                type: 'password'
            }
        ]);
    }

    private createRedisConfiguration(config: ServerConfig, answers: inquirer.Answers) {
        if (answers['connectionType'] === 'standalone') {
            config.database.redis = {
                standalone: {
                    host: answers['host'],
                    port: parseInt(answers['port'], 10)
                }
            };
        } else {
            config.database.redis = {
                cluster: [{
                    host: answers['host'],
                    port: parseInt(answers['port'], 10)
                }]
            };
        }
        if (answers['db'] || answers['password']) {
            config.database.redis.options = {};
            if (answers['db']) {
                config.database.redis.options.db = parseInt(answers['db'], 10);
            }
            if (answers['password']) {
                config.database.redis.options.password = answers['password'];
            }
        }
    }

    private loadDefaultGatewayConfig(): GatewayConfig {
        const gateway: GatewayConfig = YAML.load(require.resolve('./tree-gateway-default.yaml'));
        console.info(`No configuration for gateway was found. Using default configuration and saving it on database.`);
        gateway.admin.userService.jwtSecret = uuid();
        return gateway;
    }

    /**
     * This function cast all array properties inside server configuration to array.
     * It is used to allow user to configure array properties as a single item too.
     * @param server Server configuration
     */
    private castArrays(server: ServerConfig) {
        castArray(server, 'database.redis.cluster');
        castArray(server, 'database.redis.sentinel.nodes');
        castArray(server, 'gateway.filter');
        castArray(server, 'gateway.admin.filter');
        castArray(server, 'gateway.serviceDiscovery.provider');
        castArray(server, 'gateway.logger.console.stderrLevels');
        castArray(server, 'gateway.accessLogger.console.stderrLevels');
        if (_.has(server, 'gateway.config.cache')) {
            _.keys(server.gateway.config.cache).forEach(cacheKey => {
                castArray(server.gateway.config.cache[cacheKey], 'server.preserveHeaders');
            });
        }
        if (_.has(server, 'gateway.config.cors')) {
            _.keys(server.gateway.config.cors).forEach(corsKey => {
                castArray(server.gateway.config.cors[corsKey], 'allowedHeaders');
                castArray(server.gateway.config.cors[corsKey], 'exposedHeaders');
                castArray(server.gateway.config.cors[corsKey], 'methods');
            });
        }
    }
}
