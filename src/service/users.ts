'use strict';

import { UserData } from '../config/users';
import * as express from 'express';

export abstract class UserService {
    abstract list(): Promise<Array<UserData>>;
    abstract get(login: string): Promise<UserData>;
    abstract create(user: UserData): Promise<void>;
    abstract update(user: UserData): Promise<void>;
    abstract remove(login: string): Promise<void>;
    abstract changePassword(login: string, password: string): Promise<void>;
    abstract generateToken(login: string, password: string): Promise<string>;
    abstract getAuthMiddleware(): express.RequestHandler;
}
