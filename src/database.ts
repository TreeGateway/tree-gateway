'use strict';

import * as Redis from 'ioredis';
import * as _ from 'lodash';
import { AutoWired, Inject, Singleton } from 'typescript-ioc';
import { RedisConfig } from './config/database';
import { Configuration } from './configuration';

@Singleton
@AutoWired
export class Database {
    public static GATEWAY_VERSION_KEY: string = '{config}:treegateway:version';
    public static UPDATING = `0.0.0`;

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

    public disconnect() {
        this.redisClient.disconnect();
        this.redisEvents.disconnect();
    }

    public async registerGatewayVersion(): Promise<void> {
        try {
            const packageJson = require('../package.json');
            await this.redisClient.set(Database.GATEWAY_VERSION_KEY, `${packageJson.version}`);
        } catch (err) {
            throw new Error('It was not possible to register the Tree Gateway version.');
        }
    }

    public async getGatewayVersion(): Promise<string> {
        try {
            return await this.redisClient.get(Database.GATEWAY_VERSION_KEY);
        } catch (err) {
            throw (new Error('It was not possible to retrieve the Tree Gateway version.'));
        }
    }

    public async startGatewayUpdate(): Promise<string> {
        try {
            return await this.redisClient.getset(Database.GATEWAY_VERSION_KEY, Database.UPDATING);
        } catch (err) {
            throw (new Error('It was not possible to retrieve the Tree Gateway version.'));
        }
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
            client = new Redis.Cluster(config.cluster as any, {
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
