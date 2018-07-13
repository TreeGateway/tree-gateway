'use strict';

import * as express from 'express';
import { UserData } from '../config/users';

export abstract class UserService {
    public abstract list(): Promise<Array<UserData>>;
    public abstract get(login: string): Promise<UserData>;
    public abstract create(user: UserData): Promise<void>;
    public abstract update(user: UserData): Promise<void>;
    public abstract remove(login: string): Promise<void>;
    public abstract changePassword(login: string, password: string): Promise<void>;
    public abstract generateToken(login: string, password: string): Promise<string>;
    public abstract getAuthMiddleware(): express.RequestHandler;
}
