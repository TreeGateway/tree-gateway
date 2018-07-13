'use strict';

import * as express from 'express';
import * as _ from 'lodash';
import { Container, Inject } from 'typescript-ioc';
import { ContextRequest, DELETE, Errors, FormParam, GET, Path, PathParam, POST, PUT, Return } from 'typescript-rest';
import * as swagger from 'typescript-rest-swagger';
import { UserData, validateUser } from '../../config/users';
import { UserService } from '../../service/users';

@Path('users')
@swagger.Tags('Users')
export class UsersRest {
    public static configureAuthMiddleware(app: express.Router) {
        const authenticator = Container.get(UserService).getAuthMiddleware();
        const manageUsers = (req: express.Request, res: express.Response, next: express.NextFunction) => {
            if (!req.user || !req.user.roles || (req.user.roles.indexOf('admin') < 0)) {
                return next(new Errors.ForbidenError('Access denied'));
            }
            next();
        };
        const adminGateway = (req: express.Request, res: express.Response, next: express.NextFunction) => {
            if (req.path === '/users/authentication' || req.path === '/healthcheck') {
                return next();
            }

            if (!req.user || !req.user.roles || (req.user.roles.indexOf('config') < 0)) {
                return next(new Errors.ForbidenError('Access denied'));
            }
            next();
        };
        app.use((req, res, next) => {
            if (req.path === '/users/authentication' || req.path === '/healthcheck') {
                return next();
            }
            authenticator(req, res, next);
        });
        app.get('/users', manageUsers);
        app.post('/users', manageUsers);
        app.get('/users/:login', manageUsers);
        app.put('/users/:login', manageUsers);
        app.delete('/users/:login', manageUsers);
        app.use(adminGateway);
    }

    @Inject private service: UserService;

    @GET
    @swagger.Security('Bearer')
    public list(): Promise<Array<UserData>> {
        return this.service.list();
    }

    @POST
    @swagger.Security('Bearer')
    public async addUser(user: UserData): Promise<Return.NewResource<void>> {
        await validateUser(user);
        await this.service.create(user);
        return new Return.NewResource<void>(`users/${user.login}`);
    }

    @GET
    @Path(':login')
    @swagger.Security('Bearer')
    public async getUser(@PathParam('login') login: string): Promise<UserData> {
        const user = await this.service.get(login);
        if (!user) {
            throw new Errors.NotFoundError();
        }
        return _.omit(user, 'password') as UserData;
    }

    @PUT
    @Path(':login')
    @swagger.Security('Bearer')
    public async updateUser(@PathParam('login') login: string, user: UserData): Promise<void> {
        user.login = login;
        const dbUser = await this.service.get(login);
        if (!dbUser) {
            throw new Errors.NotFoundError(`Not Found: ${login}`);
        }
        user = _.defaultsDeep(user, dbUser);
        await validateUser(user);
        await this.service.update(user);
    }

    @DELETE
    @Path(':login')
    @swagger.Security('Bearer')
    public removeUser(@PathParam('login') login: string): Promise<void> {
        return this.service.remove(login);
    }

    @POST
    @Path('/authentication')
    public async getAuthToken(@FormParam('login') login: string, @FormParam('password') password: string): Promise<string> {
        try {
            return await this.service.generateToken(login, password);
        } catch (err) {
            throw new Errors.UnauthorizedError(err.message);
        }
    }

    @POST
    @Path('/authentication/changepassword')
    @swagger.Security('Bearer')
    public changePassword(@ContextRequest req: express.Request,
        @FormParam('login') login: string,
        @FormParam('password') password: string): Promise<void> {
        if ((req.user.login !== login) &&
            (!req.user.roles || (req.user.roles.indexOf('admin') < 0))) {
            throw new Errors.ForbidenError('Access denied');
        }

        return this.service.changePassword(login, password);
    }
}
