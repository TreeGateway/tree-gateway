'use strict';

import * as bcrypt from 'bcryptjs';
import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import * as _ from 'lodash';
import * as auth from 'passport';
import { Inject } from 'typescript-ioc';
import { ValidationError } from '../../config/errors';
import { UserData } from '../../config/users';
import { Configuration } from '../../configuration';
import { Database } from '../../database';
import { NotFoundError } from '../../pipeline/error/errors';
import { MiddlewareLoader } from '../../utils/middleware-loader';
import { UserService } from '../users';

export class RedisUserService implements UserService {
    public static USERS_PREFIX = 'adminUsers';

    @Inject private config: Configuration;
    @Inject private database: Database;
    @Inject private middlewareLoader: MiddlewareLoader;

    public async list(): Promise<Array<UserData>> {
        const users = await this.database.redisClient.hgetall(RedisUserService.USERS_PREFIX);
        return _.map(_.values(users), (value: string) => _.omit(JSON.parse(value), 'password')) as Array<UserData>;
    }

    public async get(login: string): Promise<UserData> {
        const user = await this.database.redisClient.hget(RedisUserService.USERS_PREFIX, login);
        if (!user) {
            return null;
        }

        return JSON.parse(user);
    }

    public async create(user: UserData): Promise<void> {
        const exists = await this.database.redisClient.hexists(`${RedisUserService.USERS_PREFIX}`, user.login);
        if (exists) {
            throw new ValidationError(`User ${user.login} already exists`);
        }
        if (!user.password) {
            throw new ValidationError(`Password is required for user.`);
        }
        user.password = await bcrypt.hash(user.password, 10);
        await this.database.redisClient.hmset(`${RedisUserService.USERS_PREFIX}`, user.login, JSON.stringify(user));
    }

    public async changePassword(login: string, password: string): Promise<void> {
        const exists = await this.database.redisClient.hexists(`${RedisUserService.USERS_PREFIX}`, login);
        if (!exists) {
            throw new NotFoundError('User not found.');
        }
        const user: UserData = await this.get(login);
        user.password = await bcrypt.hash(user.password, 10);
        await this.database.redisClient.hmset(`${RedisUserService.USERS_PREFIX}`, user.login, JSON.stringify(user));
    }

    public async update(user: UserData): Promise<void> {
        const exists = await this.database.redisClient.hexists(`${RedisUserService.USERS_PREFIX}`, user.login);
        if (!exists) {
            throw new NotFoundError('User not found.');
        }
        const oldUser = await this.get(user.login);
        user.password = oldUser.password;
        await this.database.redisClient.hmset(`${RedisUserService.USERS_PREFIX}`, user.login, JSON.stringify(user));
    }

    public async remove(login: string): Promise<void> {
        const count = await this.database.redisClient.hdel(`${RedisUserService.USERS_PREFIX}`, login);
        if (count === 0) {
            throw new NotFoundError('User not found.');
        }
    }

    public async generateToken(login: string, password: string): Promise<string> {
        const user = await this.get(login);
        if (!user) {
            throw new ValidationError('User not found');
        }
        let same;
        try {
            same = await bcrypt.compare(password, user.password);
        } catch (err) {
            throw new ValidationError('Error validating user password');
        }
        if (!same) {
            throw new ValidationError('Invalid username / password');
        }
        try {
            const dataToken = {
                email: user.email,
                login: user.login,
                name: user.name,
                roles: user.roles
            };

            const token = jwt.sign(dataToken, this.config.gateway.admin.userService.jwtSecret, {
                expiresIn: 7200 // TODO read an human interval configuration
            });
            return token;
        } catch (err) {
            throw new ValidationError('Error validating user password');
        }
    }

    public getAuthMiddleware(): express.RequestHandler {
        const opts: any = {
            secretOrKey: this.config.gateway.admin.userService.jwtSecret
        };
        const strategy = this.middlewareLoader.loadMiddleware('authentication/strategy', { name: 'jwt', options: opts });
        auth.use('_tree_gateway_admin_', strategy);

        return auth.authenticate('_tree_gateway_admin_', { session: false, failWithError: true });
    }
}
