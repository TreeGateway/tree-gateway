'use strict';

import 'mocha';
import * as chai from 'chai';

import * as request from 'request';
import {ApiConfig} from '../../src/config/api';
import {Container} from 'typescript-ioc';
import {Configuration} from '../../src/configuration';
import {UserService} from '../../src/service/users';

const expect = chai.expect;
// tslint:disable:no-unused-expression

let config: Configuration;
let adminRequest: any;
let adminToken: string;
let configToken: string;
let simpleToken: string;

const adminUser = {
    email: 'test@mail.com',
    login: 'admin',
    name: 'Admin user',
    password: '123test',
    roles: ['tree-gateway-admin', 'tree-gateway-config']
};

const configUser = {
    email: 'test@mail.com',
    login: 'config',
    name: 'Config user',
    password: '123test',
    roles: ['tree-gateway-config']
};

const simpleUser = {
    email: 'test@mail.com',
    login: 'simple',
    name: 'Simple user',
    password: '123test',
    roles: <string[]>[]
};

const getIdFromResponse = (response: any) => {
    const location = response.headers['location'];
    expect(location).to.exist;
    const parts = location ? location.split('/') : [];
    return parts.length > 0 ? parts[parts.length-1] : null;
};

const createUsers = () => {
    return new Promise<void>((resolve, reject) => {
        const userService = Container.get(UserService);
        userService.create(adminUser)
        .then(() => userService.create(configUser))
        .then(() => userService.create(simpleUser))
        .then(resolve)
        .catch(reject);
    });
};

describe('Gateway Admin Tasks', () => {
    before(function(){
        config = Container.get(Configuration);
        adminRequest = request.defaults({baseUrl: `http://localhost:${config.gateway.admin.protocol.http.listenPort}`});
        return createUsers();
    });

    describe('/users', () => {
        it('should reject unauthenticated requests', (done) => {
            adminRequest.get('/users/admin', (error: any, response: any, body: any) => {
                expect(response.statusCode).to.equal(401);
                done();
            });
        });
        it('should be able to sign admin users in', (done) => {
            const form = {
                'login': 'admin',
                'password': '123test'
            };
            adminRequest.post({
                form: form,
                url:'/users/authentication'
            }, (error: any, response: any, body: any) => {
                expect(response.statusCode).to.equal(200);
                adminToken = body;
                done();
            });
        });
        it('should be able to sign editor users in', (done) => {
            const form = {
                'login': 'config',
                'password': '123test'
            };
            adminRequest.post({
                form: form,
                url:'/users/authentication'
            }, (error: any, response: any, body: any) => {
                expect(response.statusCode).to.equal(200);
                configToken = body;
                done();
            });
        });
        it('should be able to sign simple users in', (done) => {
            const form = {
                'login': 'simple',
                'password': '123test'
            };
            adminRequest.post({
                form: form,
                url:'/users/authentication'
            }, (error: any, response: any, body: any) => {
                expect(response.statusCode).to.equal(200);
                simpleToken = body;
                done();
            });
        });

    });

    describe('/apis', () => {
        const apiMock = <ApiConfig> {
            description: 'API mock',
            name: 'apiMock',
            path: 'newApi',
            version: '1.0'
        };

        it('should be able to create a new API', (done) => {
            adminRequest.post('/apis', {
                body: apiMock,
                headers: { 'authorization': `JWT ${configToken}` },
                json: true
            }, (error: any, response: any, body: any) => {
                expect(error).to.not.exist;
                expect(response.statusCode).to.equal(201);
                apiMock.id = getIdFromResponse(response);
                expect(apiMock.id).to.exist;
                done();
            });
        });

        it('should reject unauthenticated request to admin apis', (done) => {
            adminRequest.post('/apis', {
                body: apiMock, json: true
            }, (error: any, response: any, body: any) => {
                expect(error).to.not.exist;
                expect(response.statusCode).to.equal(401);
                done();
            });
        });

        it('should reject an invalid API', (done) => {
            adminRequest.post('/apis', {
                body: {},
                headers: { 'authorization': `JWT ${configToken}` },
                json: true
            }, (error: any, response: any, body: any) => {
                expect(error).to.not.exist;
                expect(response.statusCode).to.equal(403);
                done();
            });
        });

        it('should be able to list all APIs', (done) => {
            adminRequest.get({
                headers: { 'authorization': `JWT ${configToken}` },
                url:'/apis'
            }, (error: any, response: any, body: any) => {
                expect(error).to.not.exist;
                expect(response.statusCode).to.equal(200);
                done();
            });
        });

        it('should be able to update an API', (done) => {
            apiMock.description = 'Updated api';

            adminRequest.put(`/apis/${apiMock.id}`, {
                body: apiMock,
                headers: { 'authorization': `JWT ${configToken}` },
                json: true
            }, (error: any, response: any, body: any) => {
                expect(error).to.not.exist;
                expect(response.statusCode).to.equal(204);
                done();
            });
        });

        it('should be able to get an API', (done) => {
            adminRequest.get({
                headers: { 'authorization': `JWT ${configToken}` },
                url:`/apis/${apiMock.id}`
            }, (error: any, response: any, body: any) => {
                expect(error).to.not.exist;
                expect(response.statusCode).to.equal(200);
                const api = JSON.parse(body);
                expect(api.description).to.equal('Updated api');
                done();
            });
        });

        it('should be able to delete an API', (done) => {
            adminRequest.delete({
                headers: { 'authorization': `JWT ${configToken}` },
                url:`/apis/${apiMock.id}`
            }, (error: any, response: any, body: any) => {
                expect(error).to.not.exist;
                expect(response.statusCode).to.equal(204);
                done();
            });
        });
    });

    describe('/users', () => {
        it('should reject requests with low privileges', (done) => {
            adminRequest.delete({
                headers: { 'authorization': `JWT ${configToken}` },
                url:`/users/simple`
            }, (error: any, response: any, body: any) => {
                expect(error).to.not.exist;
                expect(response.statusCode).to.equal(403);
                done();
            });
        });
        it('should be able to add users', (done) => {
            const simpleUser2 = {
                email: 'test2@mail.com',
                login: 'simple2',
                name: 'Simple user 2',
                password: '123test',
                roles: <string[]>[]
            };

            adminRequest.post({
                body: simpleUser2,
                headers: { 'authorization': `JWT ${adminToken}` },
                json: true,
                url:`/users`
            }, (error: any, response: any, body: any) => {
                expect(error).to.not.exist;
                expect(response.statusCode).to.equal(201);
                done();
            });
        });

        it('should be able to remove users', (done) => {
            adminRequest.delete({
                headers: { 'authorization': `JWT ${adminToken}` },
                url:`/users/simple`
            }, (error: any, response: any, body: any) => {
                expect(error).to.not.exist;
                expect(response.statusCode).to.equal(204);
                done();
            });
        });
    });
});
