"use strict";

import {Redis} from "ioredis";

import {ApiService, ConfigService} from "./api";
import {NotFoundError, ValidationError} from "../error/errors";
import {ApiConfig} from "../config/api";
import {ConfigTopics, ConfigEvents} from "../config/events";
import * as uuid from "uuid";
import {Logger} from "../logger";
import {AutoWired, Provides, Singleton, Inject} from "typescript-ioc";
import {Database} from "../database";
import {MiddlewareInstaller} from "../utils/middleware-installer";
import {EventEmitter} from "events";

class Constants {
    static APIS_PREFIX = "{config}:apis";
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
                               .publish(ConfigTopics.API_ADDED, JSON.stringify({id: api.id}))
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
                               .publish(ConfigTopics.API_UPDATED, JSON.stringify({id: api.id}))
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
                .publish(ConfigTopics.API_REMOVED, JSON.stringify({id}))
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

    private onConfigUpdated(eventTopic: string, message: any) {
        if (this.logger.isDebugEnabled()) {
            this.logger.debug(`Config updated ${eventTopic}. Message: ${JSON.stringify(message)}`);
        }

        switch(eventTopic) {
            case ConfigTopics.API_REMOVED:
                this.emit(ConfigEvents.API_REMOVED, message.id);
                break;
            case ConfigTopics.API_ADDED:
                this.emit(ConfigEvents.API_ADDED, message.id);
                break;
            case ConfigTopics.API_UPDATED:
                this.emit(ConfigEvents.API_UPDATED, message.id);
                break;
            case ConfigTopics.MIDDLEWARE_ADDED:
            case ConfigTopics.MIDDLEWARE_UPDATED:
                this.middlewareInstaller.install(message.type, message.name, message.idMsg);
                break;
            case ConfigTopics.MIDDLEWARE_REMOVED:
                this.middlewareInstaller.uninstall(message.type, message.name, message.idMsg);
                break;
            default:
                this.logger.error(`Unknown event type ${eventTopic}: ${message}`);
        }
    }
}