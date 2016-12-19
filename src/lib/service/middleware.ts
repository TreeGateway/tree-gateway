"use strict";

import "es6-promise";
import * as fs from "fs-extra";
import * as path from "path";
import {Redis} from "ioredis";

// TODO: log errors
// TODO: publish events

export interface MiddlewareService {
    list(middleware: string):Promise<Array<string>>;
    add(middleware: string, name: string, content: Buffer) : Promise<string>;
    remove(middleware: string, name: string) : Promise<void>;
    save(middleware: string, name: string, content: Buffer): Promise<void>;
    // FIXME: read should return a Buffer
    read(middleware: string, name: string): Promise<Buffer>;
}

export class RedisMiddlewareService implements MiddlewareService {
    private static MIDDLEWARE_PREFIX = "config:middleware";
    private redisClient:Redis;

    constructor(redisClient) {
        this.redisClient = redisClient;
    }

    list(middleware: string) : Promise<Array<string>>{
        return new Promise<Array<string>>((resolve, reject) =>{
            this.redisClient.smembers(`${RedisMiddlewareService.MIDDLEWARE_PREFIX}:${middleware}`)
                    .then(resolve)
                    .catch(reject);
        });
    }

    add(middleware: string, name: string, content: Buffer) : Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.save(middleware, name, content)
                    .then(() => {
                        resolve(name);
                    })
                    .catch(reject);
        });
    }

    remove(middleware: string, name: string) : Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.redisClient.multi()
                    .srem(`${RedisMiddlewareService.MIDDLEWARE_PREFIX}:${middleware}`, name)
                    .del(`${RedisMiddlewareService.MIDDLEWARE_PREFIX}:${middleware}:${name}`)
                    .exec()
                    .then(() => {
                        resolve();
                    })
                    .catch(reject);
        });
    }

    save(middleware: string, name: string, content: Buffer): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.redisClient.multi()
                    .sadd(`${RedisMiddlewareService.MIDDLEWARE_PREFIX}:${middleware}`, name)
                    .set(`${RedisMiddlewareService.MIDDLEWARE_PREFIX}:${middleware}:${name}`, content)
                    .exec()
                    .then(() => {
                        resolve();
                    })
                    .catch(reject);
        });
    }

    read(middleware: string, name: string): Promise<Buffer> {
        return this.redisClient.get(`${RedisMiddlewareService.MIDDLEWARE_PREFIX}:${middleware}:${name}`);
    }
}