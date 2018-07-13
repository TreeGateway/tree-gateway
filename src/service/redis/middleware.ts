'use strict';

import { Inject } from 'typescript-ioc';
import { ValidationError } from '../../config/errors';
import { ConfigTopics } from '../../config/events';
import { Database } from '../../database';
import { NotFoundError } from '../../pipeline/error/errors';
import { MiddlewareService } from '../middleware';

export class RedisMiddlewareService implements MiddlewareService {
    private static MIDDLEWARE_PREFIX = '{config}:middleware';
    private static ADMIN_API = 'ADMIN_API';

    @Inject private database: Database;

    public async list(middleware: string, filter?: string): Promise<Array<string>> {
        let result: Array<string> = await this.database.redisClient.smembers(`${RedisMiddlewareService.MIDDLEWARE_PREFIX}:${middleware}`);
        result = result.filter((middlwareName: string) => {
            if (filter && !middlwareName.includes(filter)) {
                return false;
            }
            return true;
        });

        return result;
    }

    public async add(middleware: string, name: string, content: Buffer): Promise<string> {
        await this.ensureMiddlewareCreateConstraints(middleware, name);
        await this.save(middleware, name, content);
        return name;
    }

    public async remove(middleware: string, name: string): Promise<void> {
        await this.database.redisClient.multi()
            .srem(`${RedisMiddlewareService.MIDDLEWARE_PREFIX}:${middleware}`, name)
            .del(`${RedisMiddlewareService.MIDDLEWARE_PREFIX}:${middleware}:${name}`)
            .publish(ConfigTopics.CONFIG_UPDATED, JSON.stringify({ packageId: RedisMiddlewareService.ADMIN_API }))
            .exec();
    }

    public async update(middleware: string, name: string, content: Buffer, upsert?: boolean): Promise<void> {
        await this.ensureMiddlewareUpdateConstraints(middleware, name, upsert);
        await this.save(middleware, name, content);
    }

    public read(middleware: string, name: string): Promise<Buffer> {
        return this.database.redisClient.get(`${RedisMiddlewareService.MIDDLEWARE_PREFIX}:${middleware}:${name}`);
    }

    private async save(middleware: string, name: string, content: Buffer): Promise<void> {
        await this.database.redisClient.multi()
            .sadd(`${RedisMiddlewareService.MIDDLEWARE_PREFIX}:${middleware}`, name)
            .set(`${RedisMiddlewareService.MIDDLEWARE_PREFIX}:${middleware}:${name}`, content)
            .publish(ConfigTopics.CONFIG_UPDATED, JSON.stringify({ packageId: RedisMiddlewareService.ADMIN_API }))
            .exec();
    }

    private async ensureMiddlewareCreateConstraints(middleware: string, name: string): Promise<void> {
        const exists = await this.database.redisClient.exists(`${RedisMiddlewareService.MIDDLEWARE_PREFIX}:${middleware}:${name}`);
        if (exists) {
            throw new ValidationError(`Middleware ${name} already exists for type ${middleware}.`);
        }
    }

    private async ensureMiddlewareUpdateConstraints(middleware: string, name: string, upsert?: boolean): Promise<void> {
        if (!upsert) {
            const exists = await this.database.redisClient.exists(`${RedisMiddlewareService.MIDDLEWARE_PREFIX}:${middleware}:${name}`);
            if (!exists) {
                throw new NotFoundError(`Middleware ${name} not found for type ${middleware}.`);
            }
        }
    }
}
