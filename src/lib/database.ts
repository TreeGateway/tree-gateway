"use strict";

import * as redis from "ioredis";
import * as dbConfig from "./redis";
import {AutoWired, Singleton, Inject} from "typescript-ioc";
import {Configuration} from "./configuration";

@Singleton
@AutoWired
export class Database {
    @Inject private config: Configuration;
    private _redisClient: redis.Redis;
    private _redisEvents: redis.Redis;

    constructor() {
        this._redisClient = dbConfig.initializeRedis(this.config.gateway.database);
        this._redisEvents = dbConfig.initializeRedis(this.config.gateway.database);        
    }

    get redisClient(): redis.Redis {
        return this._redisClient;
    }

    get redisEvents(): redis.Redis {
        return this._redisEvents;
    }

    disconnect() {
        this.redisClient.disconnect();
        this.redisEvents.disconnect();        
    }
}
