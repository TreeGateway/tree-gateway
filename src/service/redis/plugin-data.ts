'use strict';

import { EventEmitter } from 'events';
import { Inject } from 'typescript-ioc';
import { Database } from '../../database';
import { Logger } from '../../logger';
import { PluginsDataService } from '../plugin-data';

export class RedisPluginsDataService extends EventEmitter implements PluginsDataService {
    private static PREFIX = '{plugin-data}';

    @Inject private logger: Logger;
    @Inject private database: Database;

    public listConfigurationItems(configKey: string): Promise<Array<string>> {
        if (this.logger.isDebugEnabled()) {
            this.logger.debug(`Checking configuration items for plugin config key: ${RedisPluginsDataService.PREFIX}:${configKey} `);
        }
        return this.database.redisClient.smembers(`${RedisPluginsDataService.PREFIX}:${configKey}`);
    }

    public async addConfigurationItem(configKey: string, value: string): Promise<void> {
        await this.database.redisClient.sadd(`${RedisPluginsDataService.PREFIX}:${configKey}`, value);
    }

    public watchConfigurationItems(configKey: string, interval: number): NodeJS.Timer {
        const result = setInterval(() => {
            this.checkConfigurationItens(configKey);
        }, interval);

        process.nextTick(() => {
            this.checkConfigurationItens(configKey);
        });
        return result;
    }

    public stopWatchingConfigurationItems(watcherKey: NodeJS.Timer): void {
        clearInterval(watcherKey);
    }

    private checkConfigurationItens(configKey: string) {
        this.listConfigurationItems(configKey)
            .then((data: Array<string>) => {
                this.emit('changed', configKey, data);
            }).catch((err: any) => {
                this.logger.error(`Error retrieving configuration items from redis database.`);
                this.logger.inspectObject(err);
            });
    }
}
