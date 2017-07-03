'use strict';

import { Logger } from '../../logger';
import { Inject } from 'typescript-ioc';
import { Database } from '../../database';
import { EventEmitter } from 'events';
import { PluginsDataService } from '../plugin-data';

export class RedisPluginsDataService extends EventEmitter implements PluginsDataService {
    @Inject private logger: Logger;
    @Inject private database: Database;

    listConfigurationItems(configKey: string): Promise<Array<string>> {
        return this.database.redisClient.smembers(configKey);
    }

    addConfigurationItem(configKey: string, value: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.database.redisClient.sadd(configKey, value)
                .then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }

    watchConfigurationItems(configKey: string, interval: number): void {
        setInterval(() => {
            this.listConfigurationItems(configKey)
                .then((data: Array<string>) => {
                    this.emit('changed', configKey, data);
                }).catch((err: any) => {
                    this.logger.error(`Error retrieving configuration items from redis database. ${this.logger.inspectObject(err.message)}`);
                });
        }, interval);
    }
}
