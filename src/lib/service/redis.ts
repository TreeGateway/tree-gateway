"use strict";

import {Redis} from "ioredis";

import * as uuid from "uuid";
import * as os from "os";
import {ApiService, ConfigService} from "./api";
import {NotFoundError, ValidationError} from "../error/errors";
import {ApiConfig} from "../config/api";
import {ConfigTopics, ConfigEvents} from "../config/events";
import {Logger} from "../logger";
import {AutoWired, Provides, Singleton, Inject} from "typescript-ioc";
import {Database} from "../database";
import {MiddlewareInstaller} from "../utils/middleware-installer";
import {EventEmitter} from "events";
import {getMachineId} from "../utils/machine";

class Constants {
    static APIS_PREFIX = "{config}:apis";
    static ADMIN_API = 'ADMIN_API';
    static MIDDLEWARE_INSTALLATION = "{middleware_installation}";
}

@AutoWired
export class RedisService {
    @Inject
    protected database: Database;
}

@AutoWired
@Singleton
@Provides(ApiService)
export class RedisApiService extends RedisService implements ApiService {
    list(): Promise<Array<ApiConfig>> {
        return new Promise((resolve, reject) => {
            this.database.redisClient.hgetall(Constants.APIS_PREFIX)
                .then((apis) => {
                    apis = Object.keys(apis).map(key => JSON.parse(apis[key]));
                    resolve(apis);
                })
                .catch(reject);
        });
    }

    get(id: string): Promise<ApiConfig> {
        return new Promise((resolve, reject) => {
            this.database.redisClient.hget(Constants.APIS_PREFIX, id)
                .then((api) => {
                    if (!api) {
                        throw new NotFoundError('Api not found.');
                    }

                    resolve(JSON.parse(api));
                })
                .catch(reject);
        });
    }

    create(api: ApiConfig): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            api.id = uuid();

            this.database.redisClient.hexists(`${Constants.APIS_PREFIX}`, api.id)
                .then((exists) => {
                    if (exists) {
                        throw new ValidationError(`Api ${api.id} already exists`)
                    }

                    return this.database.redisClient.multi()
                               .hmset(`${Constants.APIS_PREFIX}`, api.id, JSON.stringify(api))
                               .publish(ConfigTopics.CONFIG_UPDATED, JSON.stringify({id: Constants.ADMIN_API}))
                               .exec()
                })
                .then(() => {
                    resolve(api.id);
                })
                .catch(reject);
        });
    }

    update(api: ApiConfig): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.database.redisClient.hexists(`${Constants.APIS_PREFIX}`, api.id)
                .then((exists) => {
                    if (!exists) {
                        throw new NotFoundError('Api not found.');
                    }

                    return this.database.redisClient.multi()
                               .hmset(`${Constants.APIS_PREFIX}`, api.id, JSON.stringify(api))
                               .publish(ConfigTopics.CONFIG_UPDATED, JSON.stringify({id: api.id}))
                               .exec();
                })
                .then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }

    remove(id: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            // TODO: remove children
            this.database.redisClient.multi()
                .hdel(`${Constants.APIS_PREFIX}`, id)
                .publish(ConfigTopics.CONFIG_UPDATED, JSON.stringify({id: Constants.ADMIN_API}))
                .exec()
                .then((count) => {
                    // FIXME: multi() does not return count.
                    if (count === 0) {
                        throw new NotFoundError('Api not found.');
                    }

                    resolve();
                })
                .catch(reject);
        });
    }
}

@AutoWired
@Singleton
@Provides(ConfigService)
export class RedisConfigService extends EventEmitter implements ConfigService {
    @Inject private logger: Logger;
    @Inject private apiService: ApiService;
    @Inject private middlewareInstaller: MiddlewareInstaller;
    @Inject private database: Database;

    getApiConfig(apiId: string): Promise<ApiConfig> {
        return this.apiService.get(apiId);
    }

    getAllApiConfig(): Promise<Array<ApiConfig>> {
        return this.apiService.list();
    }

    subscribeEvents(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const topicPattern = `${ConfigTopics.BASE_TOPIC}:*`;

            this.database.redisEvents.psubscribe(topicPattern)
                .then(() => {
                    return this.database.redisEvents.on('pmessage', (pattern, channel, message) => {
                        try {
                            this.onConfigUpdated(channel, JSON.parse(message));
                        } catch (err) {
                            this.logger.error(`Error processing config event: ${err.message}`);
                        }
                    });
                })
                .then(() => {
                    if (this.logger.isDebugEnabled()) {
                        this.logger.debug(`Listening to events on topic ${topicPattern}`);
                    }

                    resolve();
                })
                .catch(reject);
        });
    }

    installAllMiddlewares(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const machineId = getMachineId();
            const host = os.hostname();
            const idMsg = 'allMiddlewares';
            this.database.redisClient.multi()
                .setnx(`${Constants.MIDDLEWARE_INSTALLATION}:${host}`, machineId)
                .setnx(`${Constants.MIDDLEWARE_INSTALLATION}:${host}:${idMsg}`, machineId)
                .exec()
                .then(replies => {
                    if (replies[0][1] === 1 && replies[1][1] === 1) {
                        this.database.redisClient.expire(`${Constants.MIDDLEWARE_INSTALLATION}:${host}`, 15);
                        this.database.redisClient.expire(`${Constants.MIDDLEWARE_INSTALLATION}:${host}:${idMsg}`, 15);
                        this.middlewareInstaller.installAll()
                            .then(()=> this.database.redisClient.del(`${Constants.MIDDLEWARE_INSTALLATION}:${host}`, 
                                                                     `${Constants.MIDDLEWARE_INSTALLATION}:${host}:${idMsg}`))
                            .then(resolve)
                            .catch(reject);
                    }
                    else {
                        this.runAfterMiddlewareInstallations(idMsg, resolve);
                    }
                }) 
        });
    }

    private runAfterMiddlewareInstallations(idMsg: string, callback: () => void): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const host = os.hostname();
            let interval;
            interval = setInterval(()=>{
                this.database.redisClient.exists(`${Constants.MIDDLEWARE_INSTALLATION}:${host}`, 
                                                 `${Constants.MIDDLEWARE_INSTALLATION}:${host}:${idMsg}`)
                    .then(exists => {
                        if (exists < 2) {
                            clearInterval(interval);
                            return callback();
                        }
                    })
            }, 100);
        });
    }

    private onConfigUpdated(eventTopic: string, message: any) {
        if (this.logger.isDebugEnabled()) {
            this.logger.debug(`Config updated ${eventTopic}. Message: ${JSON.stringify(message)}`);
        }
        switch(eventTopic) {
            case ConfigTopics.CONFIG_UPDATED:
                this.emit(ConfigEvents.CONFIG_UPDATED, message.packageId);
                break;
            default:
                this.logger.error(`Unknown event type ${eventTopic}: ${message}`);
        }
    }
}

