'use strict';

import 'mocha';
import * as chai from 'chai';

import * as fs from 'fs-extra-promise';
import * as path from 'path';
import {Container} from 'typescript-ioc';
import {Configuration} from '../../src/configuration';
import {Gateway} from '../../src/gateway';
import {Database} from '../../src/database';
import {SDK} from '../../src/admin/config/sdk';
import * as YAML from 'yamljs';

const expect = chai.expect;
// tslint:disable:no-unused-expression
// tslint:disable:no-console

let config: Configuration;
let database: Database;
let gateway: Gateway;
let sdk: SDK = null;

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
                    config.on('error', error => {
                        reject(error);
                    });
            });
        }
    });

    it('should be able to install Middlewares', async () => {
        const base = path.join(process.cwd(), './test/data/middleware/');
        await sdk.middleware.addAuthStrategy('myJwtStrategy', path.join(base, '/authentication/strategy', 'myJwtStrategy.js'));
        await sdk.middleware.addAuthVerify('verifyBasicUser', path.join(base, '/authentication/verify', 'verifyBasicUser.js'));
        await sdk.middleware.addAuthVerify('verifyJwtUser', path.join(base, '/authentication/verify', 'verifyJwtUser.js'));
        await sdk.middleware.addFilter('myCustomFilter', path.join(base, '/filter', 'myCustomFilter.js'));
        await sdk.middleware.addFilter('mySecondFilter', path.join(base, '/filter', 'mySecondFilter.js'));
        await sdk.middleware.addRequestInterceptor('myRequestInterceptor', path.join(base, '/interceptor/request', 'myRequestInterceptor.js'));
        await sdk.middleware.addRequestInterceptor('mySecondRequestInterceptor', path.join(base, '/interceptor/request', 'mySecondRequestInterceptor.js'));
        await sdk.middleware.addRequestInterceptor('changeBodyInterceptor', path.join(base, '/interceptor/request', 'changeBodyInterceptor.js'));
        await sdk.middleware.addResponseInterceptor('myResponseInterceptor', path.join(base, '/interceptor/response', 'myResponseInterceptor.js'));
        await sdk.middleware.addResponseInterceptor('SecondInterceptor', path.join(base, '/interceptor/response', 'SecondInterceptor.js'));
        await sdk.middleware.addResponseInterceptor('changeBodyResponseInterceptor', path.join(base, '/interceptor/response', 'changeBodyResponseInterceptor.js'));
        await sdk.middleware.addResponseInterceptor('removeHeaderResponseInterceptor', path.join(base, '/interceptor/response', 'removeHeaderResponseInterceptor.js'));
        await sdk.middleware.addCircuitBreaker('myOpenHandler', path.join(base, '/circuitbreaker', 'myOpenHandler.js'));
        await sdk.middleware.addCors('corsOrigin', path.join(base, '/cors/origin', 'corsOrigin.js'));
        await sdk.middleware.addErrorHandler('errorHandler', path.join(base, '/errorhandler', 'errorHandler.js'));
        await timeout(1500);
    });

    it('should be able to install APIs', async () => {
        const pathApi = './test/data/apis/';

        const files = await fs.readdirAsync(pathApi);
        let promises = files.filter(file => !file.endsWith('.DS_Store')).map( async file => {
            if (file.endsWith('.yml') || file.endsWith('.yaml')) {
                const api = YAML.load(pathApi+file);
                return api;
            }
            return await fs.readJsonAsync(pathApi+file);
        });
        let apis = await Promise.all(promises);
        promises = apis.map(apiConfig => sdk.apis.addApi(apiConfig));
        apis = await Promise.all(promises);
        await timeout(1000);
    });

    it('should be able to reject APIs with invalid IDs', async () => {
        try {
            await sdk.apis.addApi({
                id: 'INVALID_ID',
                name: 'Invalid API',
                path: '/invalid',
                proxy: {
                    target: {
                        host: 'http://httpbin.org'
                    }
                },
                version: '1.0.0'
            });
            throw new Error('API could not be created with invalid ID');
        } catch (err) {
            expect(err.statusCode).to.eq(403);
        }
    });

    it('should be able to export Gateway Configuration', async () => {
        const conf = await sdk.config.get();
        expect(conf.middlewares.length).to.eq(15);
    });

    async function startGateway() {
        database = Container.get(Database);
        gateway = Container.get(Gateway);
        await database.redisClient.flushdb();
        await gateway.start();
        await gateway.startAdmin();
        gateway.server.set('env', 'test');
        sdk = await SDK.initialize(config.gateway);
    }

    function timeout(ms: number) {
        return new Promise<void>(resolve => setTimeout(resolve, ms));
    }
});
