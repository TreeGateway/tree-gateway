'use strict';

import { ConfigTopics } from '../../config/events';
import { GatewayConfig } from '../../config/gateway';
import { Inject } from 'typescript-ioc';
import { Database } from '../../database';
import { NotFoundError } from '../../error/errors';
import { GatewayService } from '../gateway';

export class RedisGatewayService implements GatewayService {
    private static GATEWAY_CONFIG_KEY = '{config}:gateway';
    private static ADMIN_API = 'ADMIN_API';

    @Inject
    private database: Database;

    remove(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.database.redisClient.multi()
                .del(RedisGatewayService.GATEWAY_CONFIG_KEY)
                .publish(ConfigTopics.CONFIG_UPDATED, JSON.stringify({ id: RedisGatewayService.ADMIN_API, needsReload: true }))
                .exec()
                .then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }

    save(content: GatewayConfig): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.database.redisClient.multi()
                .set(RedisGatewayService.GATEWAY_CONFIG_KEY, JSON.stringify(content))
                .publish(ConfigTopics.CONFIG_UPDATED, JSON.stringify({ id: RedisGatewayService.ADMIN_API, needsReload: true }))
                .exec()
                .then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }

    read(): Promise<GatewayConfig> {
        return new Promise<GatewayConfig>((resolve, reject) => {
            this.get()
                .then((config: any) => {
                    if (!config) {
                        throw new NotFoundError('Config not found.');
                    }
                    resolve(config);
                }).catch(reject);
        });
    }

    get(): Promise<GatewayConfig> {
        return new Promise<GatewayConfig>((resolve, reject) => {
            this.database.redisClient.get(RedisGatewayService.GATEWAY_CONFIG_KEY)
                .then((config: any) => {
                    if (!config) {
                        return resolve(null);
                    }
                    resolve(JSON.parse(config));
                }).catch(reject);
        });
    }
}
