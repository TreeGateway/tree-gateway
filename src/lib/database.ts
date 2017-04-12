"use strict";

import * as Redis from "ioredis";
import {RedisConfig} from "./config/gateway"
import * as _ from "lodash";
import {AutoWired, Singleton, Inject} from "typescript-ioc";
import {Configuration} from "./configuration";
import {checkEnvVariable} from "./utils/env";

@Singleton
@AutoWired
export class Database {
    @Inject private config: Configuration;
    private _redisClient: Redis.Redis;
    private _redisEvents: Redis.Redis;

    constructor() {
        this._redisClient = this.initializeRedis(this.config.database);
        this._redisEvents = this.initializeRedis(this.config.database);        
    }

    get redisClient(): Redis.Redis {
        return this._redisClient;
    }

    get redisEvents(): Redis.Redis {
        return this._redisEvents;
    }

    disconnect() {
        this.redisClient.disconnect();
        this.redisEvents.disconnect();        
    }

    private initializeRedis(config: RedisConfig) {
        let client;

        config = _.defaults(config, {
            options: {}
        });

        if (config.cluster) {
            config.cluster.forEach(node => {
                node.port = checkEnvVariable(node.port, true)
                node.host = checkEnvVariable(node.host)
            });
            client = new Redis.Cluster(<any> config.cluster, {
                scaleReads: "all",
                redisOptions: config.options
            });
        }
        else if (config.sentinel) {
            const params = _.defaults(config.options, {
                sentinels: config.sentinel.nodes,
                name: config.sentinel.name
            });
            config.sentinel.nodes.forEach(node => {
                node.port = checkEnvVariable(node.port, true)
                node.host = checkEnvVariable(node.host)
            });
            client = new Redis(params);
        }
        else {
            config.standalone = _.defaults(config.standalone, {
                host: "localhost",
                port: 6379
            });

            if (config.standalone.password) {
                config.options.password = config.standalone.password;
            }

            client = new Redis(checkEnvVariable(config.standalone.port, true), 
                               checkEnvVariable(config.standalone.host), config.options);
        }
        
        return client;
    }
}
