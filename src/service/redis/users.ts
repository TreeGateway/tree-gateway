'use strict';

import { UserData } from '../../config/users';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Strategy, ExtractJwt } from 'passport-jwt';
import * as auth from 'passport';
import * as _ from 'lodash';
import * as express from 'express';
import { Inject } from 'typescript-ioc';
import { Configuration } from '../../configuration';
import { Database } from '../../database';
import { NotFoundError, ValidationError } from '../../error/errors';
import { UserService } from '../users';

export class RedisUserService implements UserService {
    static USERS_PREFIX = 'adminUsers';

    @Inject private config: Configuration;
    @Inject private database: Database;

    list(): Promise<Array<UserData>> {
        return new Promise((resolve, reject) => {
            this.database.redisClient.hgetall(RedisUserService.USERS_PREFIX)
                .then((users: any) => {
                    resolve(_.map(_.values(users), (value: string) => _.omit(JSON.parse(value), 'password')));
                })
                .catch(reject);
        });
    }

    get(login: string): Promise<UserData> {
        return new Promise((resolve, reject) => {
            this.database.redisClient.hget(RedisUserService.USERS_PREFIX, login)
                .then((user: string) => {
                    if (!user) {
                        return resolve(null);
                    }

                    return resolve(JSON.parse(user));
                })
                .catch(reject);
        });
    }

    create(user: UserData): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.database.redisClient.hexists(`${RedisUserService.USERS_PREFIX}`, user.login)
                .then((exists: number) => {
                    if (exists) {
                        throw new ValidationError(`User ${user.login} already exists`);
                    }
                    if (!user.password) {
                        throw new ValidationError(`Password is required for user.`);
                    }
                    return bcrypt.hash(user.password, 10);
                }).then((password: string) => {
                    user.password = password;
                    return this.database.redisClient.hmset(`${RedisUserService.USERS_PREFIX}`, user.login, JSON.stringify(user));
                }).then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }

    changePassword(login: string, password: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let user: UserData;
            this.database.redisClient.hexists(`${RedisUserService.USERS_PREFIX}`, login)
                .then((exists: number) => {
                    if (!exists) {
                        throw new NotFoundError('User not found.');
                    }
                    return this.get(login);
                }).then((dbUser: UserData) => {
                    user = dbUser;
                    return bcrypt.hash(user.password, 10);
                }).then((encryptedPassword: string) => {
                    user.password = encryptedPassword;
                    return this.database.redisClient.hmset(`${RedisUserService.USERS_PREFIX}`, user.login, JSON.stringify(user));
                }).then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }

    update(user: UserData): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.database.redisClient.hexists(`${RedisUserService.USERS_PREFIX}`, user.login)
                .then((exists: number) => {
                    if (!exists) {
                        throw new NotFoundError('User not found.');
                    }
                    return this.get(user.login);
                }).then((oldUser: UserData) => {
                    user.password = oldUser.password;
                    return this.database.redisClient.hmset(`${RedisUserService.USERS_PREFIX}`, user.login, JSON.stringify(user));
                }).then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }

    remove(login: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.database.redisClient.hdel(`${RedisUserService.USERS_PREFIX}`, login)
                .then((count: number) => {
                    if (count === 0) {
                        throw new NotFoundError('User not found.');
                    }

                    resolve();
                })
                .catch(reject);
        });
    }

    generateToken(login: string, password: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.get(login)
                .then(user => {
                    if (!user) {
                        return reject('User not found');
                    }
                    bcrypt.compare(password, user.password, (err, same) => {
                        if (err) {
                            return reject('Error validating user password');
                        }
                        if (!same) {
                            reject('Invalid username / password');
                            return;
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
                            resolve(token);
                        } catch (e) {
                            reject('Error validating user password');
                        }
                    });
                }).catch(err => {
                    reject('Error searching for user');
                });
        });
    }

    getAuthMiddleware(): express.RequestHandler {
        const opts: any = {
            jwtFromRequest: ExtractJwt.fromAuthHeader(),
            secretOrKey: this.config.gateway.admin.userService.jwtSecret
        };
        const strategy = new Strategy(opts, function(jwtPayload, done) {
            return done(null, jwtPayload);
        });
        auth.use('_tree_gateway_admin_', strategy);

        return auth.authenticate('_tree_gateway_admin_', { session: false, failWithError: true });
    }
}
