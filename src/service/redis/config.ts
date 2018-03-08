'use strict';

import * as os from 'os';
import { ApiService } from '../api';
import { ConfigService } from '../config';
import { ApiConfig } from '../../config/api';
import { ConfigTopics, ConfigEvents } from '../../config/events';
import { Logger } from '../../logger';
import { AutoWired, Singleton, Inject } from 'typescript-ioc';
import { Database } from '../../database';
import { MiddlewareInstaller } from '../../utils/middleware-installer';
import { EventEmitter } from 'events';
import { getMachineId } from '../../utils/machine';

class Constants {
    static MIDDLEWARE_INSTALLATION = '{middleware_installation}';
}

@AutoWired
@Singleton
export class RedisConfigService extends EventEmitter implements ConfigService {
    @Inject private logger: Logger;
    @Inject private apiService: ApiService;
    @Inject private middlewareInstaller: MiddlewareInstaller;
    @Inject private database: Database;
    private subscribed: boolean = false;

    getApiConfig(apiId: string): Promise<ApiConfig> {
        return this.apiService.get(apiId);
    }

    getAllApiConfig(): Promise<Array<ApiConfig>> {
        return this.apiService.list();
    }

    async subscribeEvents(): Promise<void> {
        if (!this.subscribed) {
            const topicPattern = `${ConfigTopics.BASE_TOPIC}:*`;
            await this.database.redisEvents.psubscribe(topicPattern);
            await this.database.redisEvents.on('pmessage', (pattern: string, channel: string, message: string) => {
                if (this.logger.isDebugEnabled()) {
                    this.logger.debug(`Message Received on topic ${channel}. Message: ${JSON.stringify(message)}`);
                }
                try {
                    const parsedMesg = JSON.parse(message);
                    switch (channel) {
                        case ConfigTopics.CONFIG_UPDATED:
                            this.emit(ConfigEvents.CONFIG_UPDATED, parsedMesg.packageId, parsedMesg.needsReload);
                            break;
                        case ConfigTopics.CIRCUIT_CHANGED:
                            this.emit(ConfigEvents.CIRCUIT_CHANGED, parsedMesg.id, parsedMesg.state);
                            break;
                        default:
                        // Ignore event
                    }
                } catch (err) {
                    this.logger.error(`Error processing received message. Message: ${message}. Err: ${this.logger.inspectObject(err)}`);
                }
            });
            if (this.logger.isDebugEnabled()) {
                this.logger.debug(`Listening to events on topic ${topicPattern}`);
            }
            this.subscribed = true;
        }
    }

    async installAllMiddlewares(): Promise<void> {
        const machineId = getMachineId();
        const host = os.hostname();
        const idMsg = 'allMiddlewares';
        const replies = await this.database.redisClient.multi()
            .setnx(`${Constants.MIDDLEWARE_INSTALLATION}:${host}`, machineId)
            .setnx(`${Constants.MIDDLEWARE_INSTALLATION}:${host}:${idMsg}`, machineId)
            .expire(`${Constants.MIDDLEWARE_INSTALLATION}:${host}`, 60)
            .expire(`${Constants.MIDDLEWARE_INSTALLATION}:${host}:${idMsg}`, 60)
            .exec();
        if (replies[0][1] === 1 && replies[1][1] === 1) {
            this.database.redisClient.expire(`${Constants.MIDDLEWARE_INSTALLATION}:${host}`, 15);
            this.database.redisClient.expire(`${Constants.MIDDLEWARE_INSTALLATION}:${host}:${idMsg}`, 15);
            await this.middlewareInstaller.installAll();
            await this.database.redisClient.del(`${Constants.MIDDLEWARE_INSTALLATION}:${host}`,
                    `${Constants.MIDDLEWARE_INSTALLATION}:${host}:${idMsg}`);
        } else {
            await this.runAfterMiddlewareInstallations(idMsg);
        }
    }

    private async runAfterMiddlewareInstallations(idMsg: string) {
        return new Promise<void>((resolve, reject) => {
            const host = os.hostname();
            let interval: NodeJS.Timer;
            interval = setInterval(() => {
                this.database.redisClient.exists(`${Constants.MIDDLEWARE_INSTALLATION}:${host}`,
                    `${Constants.MIDDLEWARE_INSTALLATION}:${host}:${idMsg}`)
                    .then((exists: number) => {
                        if (exists < 2) {
                            clearInterval(interval);
                            return resolve();
                        }
                    }).catch((err: any) => {
                        clearInterval(interval);
                        return reject(err);
                    });
            }, 100);
        });
    }
}
