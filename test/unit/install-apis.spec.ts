'use strict';

import 'mocha';

import * as request from 'request';
import * as fs from 'fs-extra-promise';
import * as path from 'path';
import {Container} from 'typescript-ioc';
import {Configuration} from '../../src/configuration';
import {Gateway} from '../../src/gateway';
import {Database} from '../../src/database';
import {UserService} from '../../src/service/users';
import {SDK} from '../../src/admin/config/sdk';
import * as YAML from 'yamljs';

// tslint:disable:no-unused-expression
// tslint:disable:no-console

let config: Configuration;
let database: Database;
let gateway: Gateway;
let gatewayRequest: any;
let sdk: SDK = null;
let loadedApis: string[];

const installUser = {
    email: 'test@mail.com',
    login: 'install-user',
    name: 'Config user',
    password: '123test',
    roles: ['tree-gateway-admin', 'tree-gateway-config']
};

const createUser = () => {
    return new Promise<{login: string, password: string}>((resolve, reject) => {
        const userService = Container.get(UserService);
        userService.create(installUser)
        .then(() => resolve(installUser))
        .catch(reject);
    });
};

describe('Gateway APIs install', () => {
    before(() => {
        config = Container.get(Configuration);
        if (config.loaded) {
            return startGateway();
        } else {
            return new Promise<void>((resolve, reject) => {
                    config.on('load', () => {
                        startGateway()
                            .then(resolve)
                            .catch(reject);
                    });
            });
        }
    });

    it('should be able to install Middlewares', () => {
         return new Promise<void>((resolve, reject) => {
             const base = path.join(process.cwd(), './test/data/middleware/');
             sdk.middleware.addAuthStrategy('myJwtStrategy', path.join(base, '/authentication/strategy', 'myJwtStrategy.js'))
             .then(() => sdk.middleware.addAuthVerify('verifyBasicUser', path.join(base, '/authentication/verify', 'verifyBasicUser.js')))
             .then(() => sdk.middleware.addAuthVerify('verifyJwtUser', path.join(base, '/authentication/verify', 'verifyJwtUser.js')))
             .then(() => sdk.middleware.addFilter('myCustomFilter', path.join(base, '/filter', 'myCustomFilter.js')))
             .then(() => sdk.middleware.addFilter('mySecondFilter', path.join(base, '/filter', 'mySecondFilter.js')))
             .then(() => sdk.middleware.addRequestInterceptor('myRequestInterceptor', path.join(base, '/interceptor/request', 'myRequestInterceptor.js')))
             .then(() => sdk.middleware.addRequestInterceptor('mySecondRequestInterceptor', path.join(base, '/interceptor/request', 'mySecondRequestInterceptor.js')))
             .then(() => sdk.middleware.addRequestInterceptor('changeBodyInterceptor', path.join(base, '/interceptor/request', 'changeBodyInterceptor.js')))
             .then(() => sdk.middleware.addResponseInterceptor('myResponseInterceptor', path.join(base, '/interceptor/response', 'myResponseInterceptor.js')))
             .then(() => sdk.middleware.addResponseInterceptor('SecondInterceptor', path.join(base, '/interceptor/response', 'SecondInterceptor.js')))
             .then(() => sdk.middleware.addResponseInterceptor('changeBodyResponseInterceptor', path.join(base, '/interceptor/response', 'changeBodyResponseInterceptor.js')))
             .then(() => sdk.middleware.addResponseInterceptor('removeHeaderResponseInterceptor', path.join(base, '/interceptor/response', 'removeHeaderResponseInterceptor.js')))
             .then(() => sdk.middleware.addCircuitBreaker('myOpenHandler', path.join(base, '/circuitbreaker', 'myOpenHandler.js')))
             .then(() => sdk.middleware.addCors('corsOrigin', path.join(base, '/cors/origin', 'corsOrigin.js')))
             .then(() => {
                 setTimeout(resolve, 1500);
             })
             .catch(reject);
        });
    });

    it('should be able to install APIs', () => {
         return new Promise<void>((resolve, reject) => {
            const pathApi = './test/data/apis/';

            fs.readdirAsync(pathApi)
                .then((files) => {
                    const promises = files.filter(file => !file.endsWith('.DS_Store')).map(file => {
                        if (file.endsWith('.yml') || file.endsWith('.yaml')) {
                            const api = YAML.load(pathApi+file);
                            return Promise.resolve(api);
                        }
                        return fs.readJsonAsync(pathApi+file);
                    });
                    return Promise.all(promises);
                })
                .then((apis: any[]) => {
                    const promises = apis.map(apiConfig => sdk.apis.addApi(apiConfig));
                    return Promise.all(promises);
                })
                .then((apis) => {
                    loadedApis = apis;
                    setTimeout(resolve, 1000);
                })
                .catch(reject);
        });
    });

    function startGateway() {
        return new Promise<void>((resolve, reject) => {
            const swaggerUrl = `http://localhost:${config.gateway.admin.protocol.http.listenPort}/${config.gateway.admin.apiDocs.path}/json`;
            database = Container.get(Database);
            gateway = Container.get(Gateway);
            gateway.start()
            .then(() => gateway.startAdmin())
            .then(() => {
                gateway.server.set('env', 'test');
                gatewayRequest = request.defaults({baseUrl: `http://localhost:${config.gateway.protocol.http.listenPort}`});

                return database.redisClient.flushdb();
            })
            .then(() => createUser())
            .then((user) => SDK.initialize(swaggerUrl, 'install-user', '123test'))
            .then((s) => {
                sdk = s;
                resolve();
            })
            .catch(reject);
        });
    }
});
