'use strict';

import * as Redis from 'ioredis';
import { RedisConfig } from './config/database';
import * as _ from 'lodash';
import { AutoWired, Singleton, Inject } from 'typescript-ioc';
import { Configuration } from './configuration';

@Singleton
@AutoWired
export class Database {
    static GATEWAY_VERSION_KEY: string = '{config}:treegateway:version';
    static UPDATING = `0.0.0`;

    @Inject private config: Configuration;
    private client: Redis.Redis;
    private events: Redis.Redis;

    constructor() {
        this.client = this.initializeRedis(this.config.database.redis);
        this.events = this.initializeRedis(this.config.database.redis);
    }

    get redisClient(): Redis.Redis {
        return this.client;
    }

    get redisEvents(): Redis.Redis {
        return this.events;
    }

    disconnect() {
        this.redisClient.disconnect();
        this.redisEvents.disconnect();
    }

    registerGatewayVersion(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const packageJson = require('../package.json');
            this.redisClient.set(Database.GATEWAY_VERSION_KEY, `${packageJson.version}`)
                .then(() => {
                    return resolve();
                }).catch((err: any) => {
                    reject(new Error('It was not possible to register the Tree Gateway version.'));
                });
        });
    }

    getGatewayVersion(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.redisClient.get(Database.GATEWAY_VERSION_KEY)
                .then((version: string) => {
                    return resolve(version);
                }).catch((err: any) => {
                    reject(new Error('It was not possible to retrieve the Tree Gateway version.'));
                });
        });
    }

    startGatewayUpdate(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.redisClient.getset(Database.GATEWAY_VERSION_KEY, Database.UPDATING)
                .then((version: string) => {
                    return resolve(version);
                }).catch((err: any) => {
                    reject(new Error('It was not possible to retrieve the Tree Gateway version.'));
                });
        });
    }

    private initializeRedis(config: RedisConfig) {
        let client;

        config = _.defaults(config, {
            options: {}
        });

        if (config.cluster) {
            config.cluster.forEach(node => {
                node.port = _.toSafeInteger(node.port);
                node.host = node.host;
            });
            client = new Redis.Cluster(<any>config.cluster, {
                redisOptions: config.options,
                scaleReads: 'all'
            });
        } else if (config.sentinel) {
            const params = _.defaults(config.options, {
                name: config.sentinel.name,
                sentinels: config.sentinel.nodes
            });
            config.sentinel.nodes.forEach(node => {
                node.port = _.toSafeInteger(node.port);
                node.host = node.host;
            });
            client = new Redis(params);
        } else {
            config.standalone = _.defaults(config.standalone, {
                host: 'localhost',
                port: 6379
            });

            if (config.standalone.password) {
                config.options.password = config.standalone.password;
            }

            client = new Redis(_.toSafeInteger(config.standalone.port),
                config.standalone.host, config.options);
        }

        return client;
    }
}
