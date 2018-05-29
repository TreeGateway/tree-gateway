'use strict';

import { ConfigTopics } from '../../config/events';
import { GatewayConfig } from '../../config/gateway';
import { Inject } from 'typescript-ioc';
import { Database } from '../../database';
import { NotFoundError } from '../../pipeline/error/errors';
import { GatewayService } from '../gateway';
import { castArray } from '../../utils/config';
import * as _ from 'lodash';

export class RedisGatewayService implements GatewayService {
    private static GATEWAY_CONFIG_KEY = '{config}:gateway';
    private static ADMIN_API = 'ADMIN_API';

    @Inject
    private database: Database;

    async remove(): Promise<void> {
        await this.database.redisClient.multi()
            .del(RedisGatewayService.GATEWAY_CONFIG_KEY)
            .publish(ConfigTopics.CONFIG_UPDATED, JSON.stringify({ packageId: RedisGatewayService.ADMIN_API, needsReload: true }))
            .exec();
    }

    async save(config: GatewayConfig): Promise<void> {
        this.castArrays(config);
        await this.database.redisClient.multi()
            .set(RedisGatewayService.GATEWAY_CONFIG_KEY, JSON.stringify(config))
            .publish(ConfigTopics.CONFIG_UPDATED, JSON.stringify({ packageId: RedisGatewayService.ADMIN_API, needsReload: true }))
            .exec();
    }

    async read(): Promise<GatewayConfig> {
        const config = await this.get();
        if (!config) {
            throw new NotFoundError('Config not found.');
        }
        return (config);
    }

    async get(): Promise<GatewayConfig> {
        const config = await this.database.redisClient.get(RedisGatewayService.GATEWAY_CONFIG_KEY);
        if (!config) {
            return null;
        }
        return JSON.parse(config);
    }

    registerGatewayVersion() {
        return this.database.registerGatewayVersion();
    }

    /**
     * This function cast all array properties inside gateway configuration to array.
     * It is used to allow user to configure array properties as a single item too.
     * @param gateway Gateway configuration
     */
    private castArrays(gateway: GatewayConfig) {
        castArray(gateway, 'filter');
        castArray(gateway, 'admin.filter');
        castArray(gateway, 'serviceDiscovery.provider');
        castArray(gateway, 'logger.console.stderrLevels');
        castArray(gateway, 'accessLogger.console.stderrLevels');
        if (_.has(gateway, 'config.cache')) {
            _.keys(gateway.config.cache).forEach(cacheKey => {
                castArray(gateway.config.cache[cacheKey], 'server.preserveHeaders');
            });
        }
        if (_.has(gateway, 'config.cors')) {
            _.keys(gateway.config.cors).forEach(corsKey => {
                castArray(gateway.config.cors[corsKey], 'allowedHeaders');
                castArray(gateway.config.cors[corsKey], 'exposedHeaders');
                castArray(gateway.config.cors[corsKey], 'methods');
            });
        }
    }
}
