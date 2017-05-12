'use strict';

import { Path, GET, POST, DELETE, PUT, PathParam, FormParam, Errors, Return, ContextRequest } from 'typescript-rest';
import { UserData, validateUser } from '../../config/users';
import { UserService } from '../../service/users';
import * as _ from 'lodash';
import * as express from 'express';
import { Container, Inject } from 'typescript-ioc';
import * as swagger from 'typescript-rest-swagger';

@Path('users')
@swagger.Tags('Users')
export class UsersRest {
    @Inject private service: UserService;

    @GET
    @swagger.Security('Bearer')
    listUsers(): Promise<Array<UserData>> {
        return this.service.list();
    }

    @POST
    @swagger.Security('Bearer')
    createUser(user: UserData): Promise<Return.NewResource<void>> {
        return new Promise<Return.NewResource<void>>((resolve, reject) => {
            validateUser(user).then((validUser: UserData) =>
                this.service.create(validUser)
            )
                .then(() => {
                    resolve(new Return.NewResource<void>(`/users/${user.login}`));
                })
                .catch(reject);
        });
    }

    @GET
    @Path(':userLogin')
    @swagger.Security('Bearer')
    getUser( @PathParam('userLogin') login: string): Promise<UserData> {
        return new Promise<UserData>((resolve, reject) => {
            this.service.get(login)
                .then(user => {
                    if (user) {
                        return resolve(<UserData>_.omit(user, 'password'));
                    }
                    return reject(new Errors.NotFoundError());
                }).catch(reject);
        });
    }

    @PUT
    @Path(':userLogin')
    @swagger.Security('Bearer')
    updateUser(user: UserData): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            validateUser(user)
                .then((validUser: UserData) => this.service.update(validUser))
                .then(() => resolve())
                .catch(reject);
        });
    }

    @DELETE
    @Path(':userLogin')
    @swagger.Security('Bearer')
    removeUser( @PathParam('userLogin') login: string): Promise<void> {
        return this.service.remove(login);
    }

    @POST
    @Path('/authentication')
    getAuthToken( @FormParam('login') login: string, @FormParam('password') password: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.service.generateToken(login, password)
                .then(resolve)
                .catch(err => {
                    reject(new Errors.UnauthorizedError(err));
                });
        });
    }

    @POST
    @Path('/authentication/changepassword')
    @swagger.Security('Bearer')
    changePasswordToken( @ContextRequest req: express.Request,
        @FormParam('login') login: string,
        @FormParam('password') password: string): Promise<void> {
        if ((req.user.login !== login) ||
            (!req.user.roles ||
                (req.user.roles.indexOf('tree-gateway-admin') < 0))) {
            throw new Errors.ForbidenError('Access denied');
        }

        return this.service.changePassword(login, password);
    }

    static configureAuthMiddleware(app: express.Router) {
        const authenticator = Container.get(UserService).getAuthMiddleware();
        const manageUsers = (req: express.Request, res: express.Response, next: express.NextFunction) => {
            if (!req.user || !req.user.roles || (req.user.roles.indexOf('tree-gateway-admin') < 0)) {
                return next(new Errors.ForbidenError('Access denied'));
            }
            next();
        };
        const adminGateway = (req: express.Request, res: express.Response, next: express.NextFunction) => {
            if (req.path === '/users/authentication') {
                return next();
            }

            if (!req.user || !req.user.roles || (req.user.roles.indexOf('tree-gateway-config') < 0)) {
                return next(new Errors.ForbidenError('Access denied'));
            }
            next();
        };
        app.use((req, res, next) => {
            if (req.path === '/users/authentication') {
                return next();
            }
            authenticator(req, res, next);
        });
        app.get('/users', manageUsers);
        app.post('/users', manageUsers);
        app.get('/users/:userLogin', manageUsers);
        app.put('/users/:userLogin', manageUsers);
        app.delete('/users/:userLogin', manageUsers);
        app.use(adminGateway);
    }
}
