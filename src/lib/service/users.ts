"use strict";

import {Redis} from "ioredis";
import {UserData, UsersConfig} from "../config/users";
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import {Strategy, ExtractJwt} from 'passport-jwt';
import * as auth from "passport"; 
import * as _ from "lodash";
import * as express from "express";
import * as path from "path"; 
import {AutoWired, Inject, Provides} from "typescript-ioc";
import {Configuration} from "../configuration";
import {Database} from "../database";
import {NotFoundError, ValidationError} from "../error/errors";

export abstract class UserService {
    abstract list(): Promise<Array<UserData>>;
    abstract get(login: string): Promise<UserData>;
    abstract create(user: UserData): Promise<void>;
    abstract update(user: UserData): Promise<void>;
    abstract remove(login: string): Promise<void>;
    abstract changePassword(login: string, password: string): Promise<void>;
    abstract generateToken (login: string, password: string): Promise<string>;
    abstract getAuthMiddleware(): express.RequestHandler;
}

@AutoWired
@Provides(UserService)
class DefaultUserService implements UserService {
    static USERS_PREFIX = "adminUsers";
    
    @Inject
    private config: Configuration;
    @Inject
    private database: Database;

    list(): Promise<Array<UserData>> {
        return new Promise((resolve, reject) => {
            this.database.redisClient.hgetall(DefaultUserService.USERS_PREFIX)
                .then((apis) => {
                    resolve(_.map(_.values(apis), (value: string) => JSON.parse(value)));
                })
                .catch(reject);
        });
    }

    get(login: string): Promise<UserData> {
        return new Promise((resolve, reject) => {
            this.database.redisClient.hget(DefaultUserService.USERS_PREFIX, login)
                .then((user) => {
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
            this.database.redisClient.hexists(`${DefaultUserService.USERS_PREFIX}`, user.login)
                .then((exists) => {
                    if (exists) {
                        throw new ValidationError(`User ${user.login} already exists`)
                    }
                    return bcrypt.hash(user.password,  10);
                }).then((password) =>  {
                    user.password = password;
                    return this.database.redisClient.hmset(`${DefaultUserService.USERS_PREFIX}`, user.login, JSON.stringify(user))
                }).then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }

    changePassword(login: string, password: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let user: UserData;
            this.database.redisClient.hexists(`${DefaultUserService.USERS_PREFIX}`, login)
                .then((exists) => {
                    if (!exists) {
                        throw new NotFoundError('User not found.');
                    }
                    return this.get(login);
                }).then((dbUser: UserData) => {
                    user = dbUser;
                    return bcrypt.hash(user.password,  10);
                }).then((encryptedPassword: string) => {
                    user.password = encryptedPassword;
                    return this.database.redisClient.hmset(`${DefaultUserService.USERS_PREFIX}`, user.login, JSON.stringify(user));
                }).then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }

   
    update(user: UserData): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.database.redisClient.hexists(`${DefaultUserService.USERS_PREFIX}`, user.login)
                .then((exists) => {
                    if (!exists) {
                        throw new NotFoundError('User not found.');
                    }
                    return this.get(user.login);
                }).then((oldUser: UserData) => {
                    user.password = oldUser.password;
                    return this.database.redisClient.hmset(`${DefaultUserService.USERS_PREFIX}`, user.login, JSON.stringify(user));
                }).then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }

    remove(login: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.database.redisClient.hdel(`${DefaultUserService.USERS_PREFIX}`, login)
                .then((count) => {
                    if (count === 0) {
                        throw new NotFoundError('User not found.');
                    }

                    resolve();
                })
                .catch(reject);
        });
    }

    generateToken (login: string, password: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.get(login)
            .then(user => {
                if (!user) {
                    return reject("User not found");
                }
                bcrypt.compare(password, user.password,(err, same)=>{
                    if (err) {
                        return reject("Error validating user password");
                    }
                    if(!same){
                        reject("Invalid username / password");
                        return;
                    }
                    try {
                        let dataToken = {
                            login: user.login,
                            name: user.name,
                            email: user.email,
                            roles: user.roles
                        }
                        
                        let token = jwt.sign(dataToken, this.config.gateway.admin.userService.jwtSecret, {
                            expiresIn: 7200 // TODO read an human interval configuration
                        });
                        resolve(token);
                    }
                    catch (e) {
                        reject ("Error validating user password");
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
        }
        let strategy =  new Strategy(opts, function(jwt_payload, done) {
            return done(null,jwt_payload);
        });
        auth.use("_tree_gateway_admin_", strategy);

        return auth.authenticate("_tree_gateway_admin_", { session: false, failWithError: true });
    }        
}