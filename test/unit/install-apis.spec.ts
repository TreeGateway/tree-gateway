'use strict';

import 'mocha';
import * as chai from 'chai';
import * as chaiPromises from 'chai-as-promised';
import * as fs from 'fs-extra-promise';
import * as path from 'path';
import {Container} from 'typescript-ioc';
import {Configuration} from '../../src/configuration';
import {Gateway} from '../../src/gateway';
import {Database} from '../../src/database';
import {SDK} from '../../src/admin/config/sdk';
import * as YAML from 'yamljs';
import { ApiConfig } from '../../src/config/api';
import { ConfigPackage } from '../../src/config/config-package';

chai.use(chaiPromises);

const expect = chai.expect;
// tslint:disable:no-unused-expression
// tslint:disable:no-console

let config: Configuration;
let database: Database;
let gateway: Gateway;
let sdk: SDK = null;

describe('Gateway SDKs', () => {
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
        await sdk.middleware.addThrottlingKeyGenerator('myKeyGen', path.join(base, '/throttling/keyGenerator', 'myKeyGen.js'));
        await sdk.middleware.addThrottlingSkip('mySkip', path.join(base, '/throttling/skip', 'mySkip.js'));
        await sdk.middleware.addThrottlingHandler('myHandler', path.join(base, '/throttling/handler', 'myHandler.js'));
        await timeout(1500);
    });

    it('should be able to handle duplicated installations for Middlewares', () => {
        const base = path.join(process.cwd(), './test/data/middleware/');
        expect(sdk.middleware.addAuthStrategy('myJwtStrategy', path.join(base, '/authentication/strategy', 'myJwtStrategy.js'))).to.be.rejected;
        expect(sdk.middleware.addAuthVerify('verifyBasicUser', path.join(base, '/authentication/verify', 'verifyBasicUser.js'))).to.be.rejected;
        expect(sdk.middleware.addAuthVerify('verifyJwtUser', path.join(base, '/authentication/verify', 'verifyJwtUser.js'))).to.be.rejected;
        expect(sdk.middleware.addFilter('myCustomFilter', path.join(base, '/filter', 'myCustomFilter.js'))).to.be.rejected;
        expect(sdk.middleware.addFilter('mySecondFilter', path.join(base, '/filter', 'mySecondFilter.js'))).to.be.rejected;
        expect(sdk.middleware.addRequestInterceptor('myRequestInterceptor', path.join(base, '/interceptor/request', 'myRequestInterceptor.js'))).to.be.rejected;
        expect(sdk.middleware.addRequestInterceptor('mySecondRequestInterceptor', path.join(base, '/interceptor/request', 'mySecondRequestInterceptor.js'))).to.be.rejected;
        expect(sdk.middleware.addRequestInterceptor('changeBodyInterceptor', path.join(base, '/interceptor/request', 'changeBodyInterceptor.js'))).to.be.rejected;
        expect(sdk.middleware.addResponseInterceptor('myResponseInterceptor', path.join(base, '/interceptor/response', 'myResponseInterceptor.js'))).to.be.rejected;
        expect(sdk.middleware.addResponseInterceptor('SecondInterceptor', path.join(base, '/interceptor/response', 'SecondInterceptor.js'))).to.be.rejected;
        expect(sdk.middleware.addResponseInterceptor('changeBodyResponseInterceptor', path.join(base, '/interceptor/response', 'changeBodyResponseInterceptor.js'))).to.be.rejected;
        expect(sdk.middleware.addResponseInterceptor('removeHeaderResponseInterceptor', path.join(base, '/interceptor/response', 'removeHeaderResponseInterceptor.js'))).to.be.rejected;
        expect(sdk.middleware.addCircuitBreaker('myOpenHandler', path.join(base, '/circuitbreaker', 'myOpenHandler.js'))).to.be.rejected;
        expect(sdk.middleware.addCors('corsOrigin', path.join(base, '/cors/origin', 'corsOrigin.js'))).to.be.rejected;
        expect(sdk.middleware.addErrorHandler('errorHandler', path.join(base, '/errorhandler', 'errorHandler.js'))).to.be.rejected;
        expect(sdk.middleware.addThrottlingKeyGenerator('myKeyGen', path.join(base, '/throttling/keyGenerator', 'myKeyGen.js'))).to.be.rejected;
        expect(sdk.middleware.addThrottlingSkip('mySkip', path.join(base, '/throttling/skip', 'mySkip.js'))).to.be.rejected;
        expect(sdk.middleware.addThrottlingHandler('myHandler', path.join(base, '/throttling/handler', 'myHandler.js'))).to.be.rejected;
    });

    it('should be able to update Middlewares', async () => {
        const base = path.join(process.cwd(), './test/data/middleware/');
        await sdk.middleware.updateAuthStrategy('myJwtStrategy', path.join(base, '/authentication/strategy', 'myJwtStrategy.js'));
        await sdk.middleware.updateAuthVerify('verifyBasicUser', path.join(base, '/authentication/verify', 'verifyBasicUser.js'));
        await sdk.middleware.updateAuthVerify('verifyJwtUser', path.join(base, '/authentication/verify', 'verifyJwtUser.js'));
        await sdk.middleware.updateFilter('myCustomFilter', path.join(base, '/filter', 'myCustomFilter.js'));
        await sdk.middleware.updateFilter('mySecondFilter', path.join(base, '/filter', 'mySecondFilter.js'));
        await sdk.middleware.updateRequestInterceptor('myRequestInterceptor', path.join(base, '/interceptor/request', 'myRequestInterceptor.js'));
        await sdk.middleware.updateRequestInterceptor('mySecondRequestInterceptor', path.join(base, '/interceptor/request', 'mySecondRequestInterceptor.js'));
        await sdk.middleware.updateRequestInterceptor('changeBodyInterceptor', path.join(base, '/interceptor/request', 'changeBodyInterceptor.js'));
        await sdk.middleware.updateResponseInterceptor('myResponseInterceptor', path.join(base, '/interceptor/response', 'myResponseInterceptor.js'));
        await sdk.middleware.updateResponseInterceptor('SecondInterceptor', path.join(base, '/interceptor/response', 'SecondInterceptor.js'));
        await sdk.middleware.updateResponseInterceptor('changeBodyResponseInterceptor', path.join(base, '/interceptor/response', 'changeBodyResponseInterceptor.js'));
        await sdk.middleware.updateResponseInterceptor('removeHeaderResponseInterceptor', path.join(base, '/interceptor/response', 'removeHeaderResponseInterceptor.js'));
        await sdk.middleware.updateCircuitBreaker('myOpenHandler', path.join(base, '/circuitbreaker', 'myOpenHandler.js'));
        await sdk.middleware.updateCors('corsOrigin', path.join(base, '/cors/origin', 'corsOrigin.js'));
        await sdk.middleware.updateErrorHandler('errorHandler', path.join(base, '/errorhandler', 'errorHandler.js'));
        await sdk.middleware.updateThrottlingKeyGenerator('myKeyGen', path.join(base, '/throttling/keyGenerator', 'myKeyGen.js'));
        await sdk.middleware.updateThrottlingSkip('mySkip', path.join(base, '/throttling/skip', 'mySkip.js'));
        await sdk.middleware.updateThrottlingHandler('myHandler', path.join(base, '/throttling/handler', 'myHandler.js'));
        await timeout(1500);
    });

    it('should be able to handle invalid middleware updates', async () => {
        const base = path.join(process.cwd(), './test/data/middleware/');
        expect(sdk.middleware.updateAuthStrategy('myJwtStrategy2', path.join(base, '/authentication/strategy', 'myJwtStrategy.js'))).to.be.rejected;
        expect(sdk.middleware.updateAuthVerify('verifyBasicUser2', path.join(base, '/authentication/verify', 'verifyBasicUser.js'))).to.be.rejected;
        expect(sdk.middleware.updateAuthVerify('verifyJwtUser2', path.join(base, '/authentication/verify', 'verifyJwtUser.js'))).to.be.rejected;
        expect(sdk.middleware.updateFilter('myCustomFilter2', path.join(base, '/filter', 'myCustomFilter.js'))).to.be.rejected;
        expect(sdk.middleware.updateFilter('mySecondFilter2', path.join(base, '/filter', 'mySecondFilter.js'))).to.be.rejected;
        expect(sdk.middleware.updateRequestInterceptor('myRequestInterceptor2', path.join(base, '/interceptor/request', 'myRequestInterceptor.js'))).to.be.rejected;
        expect(sdk.middleware.updateRequestInterceptor('mySecondRequestInterceptor2', path.join(base, '/interceptor/request', 'mySecondRequestInterceptor.js'))).to.be.rejected;
        expect(sdk.middleware.updateRequestInterceptor('changeBodyInterceptor2', path.join(base, '/interceptor/request', 'changeBodyInterceptor.js'))).to.be.rejected;
        expect(sdk.middleware.updateResponseInterceptor('myResponseInterceptor2', path.join(base, '/interceptor/response', 'myResponseInterceptor.js'))).to.be.rejected;
        expect(sdk.middleware.updateResponseInterceptor('SecondInterceptor2', path.join(base, '/interceptor/response', 'SecondInterceptor.js'))).to.be.rejected;
        expect(sdk.middleware.updateResponseInterceptor('changeBodyResponseInterceptor2', path.join(base, '/interceptor/response', 'changeBodyResponseInterceptor.js'))).to.be.rejected;
        expect(sdk.middleware.updateResponseInterceptor('removeHeaderResponseInterceptor2', path.join(base, '/interceptor/response', 'removeHeaderResponseInterceptor.js'))).to.be.rejected;
        expect(sdk.middleware.updateCircuitBreaker('myOpenHandler2', path.join(base, '/circuitbreaker', 'myOpenHandler.js'))).to.be.rejected;
        expect(sdk.middleware.updateCors('corsOrigin2', path.join(base, '/cors/origin', 'corsOrigin.js'))).to.be.rejected;
        expect(sdk.middleware.updateErrorHandler('errorHandler2', path.join(base, '/errorhandler', 'errorHandler.js'))).to.be.rejected;
        expect(sdk.middleware.updateThrottlingKeyGenerator('myKeyGen2', path.join(base, '/throttling/keyGenerator', 'myKeyGen.js'))).to.be.rejected;
        expect(sdk.middleware.updateThrottlingSkip('mySkip2', path.join(base, '/throttling/skip', 'mySkip.js'))).to.be.rejected;
        expect(sdk.middleware.updateThrottlingHandler('myHandler2', path.join(base, '/throttling/handler', 'myHandler.js'))).to.be.rejected;
    });

    it('should be able to list installed Middlewares', async () => {
        expect(sdk.middleware.authStrategies()).to.eventually.have.members(['myJwtStrategy']);
        expect(sdk.middleware.authVerify()).to.eventually.have.members(['verifyBasicUser', 'verifyJwtUser']);
        expect(sdk.middleware.authVerify('verifyBasicUser')).to.eventually.not.have.members(['verifyJwtUser']);
        expect(sdk.middleware.authVerify('verifyBasicUser')).to.eventually.have.members(['verifyBasicUser']);
        expect(sdk.middleware.filters()).to.eventually.have.members(['myCustomFilter', 'mySecondFilter']);
        expect(sdk.middleware.requestInterceptors()).to.eventually.have.members(['myRequestInterceptor',
                                                                                 'mySecondRequestInterceptor',
                                                                                 'changeBodyInterceptor']);
        expect(sdk.middleware.responseInterceptors()).to.eventually.have.members(['myResponseInterceptor',
                                                                                 'SecondInterceptor',
                                                                                 'changeBodyResponseInterceptor',
                                                                                 'removeHeaderResponseInterceptor']);
        expect(sdk.middleware.circuitBreaker()).to.eventually.have.members(['myOpenHandler']);
        expect(sdk.middleware.corsOrigin()).to.eventually.have.members(['corsOrigin']);
        expect(sdk.middleware.errorHandler()).to.eventually.have.members(['errorHandler']);
        expect(sdk.middleware.throttlingKeyGenerator()).to.eventually.have.members(['myKeyGen']);
        expect(sdk.middleware.throttlingSkip()).to.eventually.have.members(['mySkip']);
        expect(sdk.middleware.throttlingHandler()).to.eventually.have.members(['myHandler']);
    });

    it('should be able to read an installed Middleware', async () => {
        expect(sdk.middleware.getAuthStrategy('myJwtStrategy')).to.be.fulfilled;
        expect(sdk.middleware.getAuthVerify('verifyBasicUser')).to.be.fulfilled;
        expect(sdk.middleware.getFilter('myCustomFilter')).to.be.fulfilled;
        expect(sdk.middleware.getRequestInterceptor('myRequestInterceptor')).to.be.fulfilled;
        expect(sdk.middleware.getResponseInterceptor('myResponseInterceptor')).to.be.fulfilled;
        expect(sdk.middleware.getCircuitBreaker('myOpenHandler')).to.be.fulfilled;
        expect(sdk.middleware.getCors('corsOrigin')).to.be.fulfilled;
        expect(sdk.middleware.getErrorHandler('errorHandler')).to.be.fulfilled;
        expect(sdk.middleware.getThrottlingKeyGenerator('myKeyGen')).to.be.fulfilled;
        expect(sdk.middleware.getThrottlingSkip('mySkip')).to.be.fulfilled;
        expect(sdk.middleware.getThrottlingHandler('myHandler')).to.be.fulfilled;
    });

    it('should be able to handle invalid middleware retrieving', async () => {
        expect(sdk.middleware.getAuthStrategy('myJwtStrategy2')).to.be.rejected;
        expect(sdk.middleware.getAuthVerify('verifyBasicUser2')).to.be.rejected;
        expect(sdk.middleware.getFilter('myCustomFilter2')).to.be.rejected;
        expect(sdk.middleware.getRequestInterceptor('myRequestInterceptor2')).to.be.rejected;
        expect(sdk.middleware.getResponseInterceptor('myResponseInterceptor2')).to.be.rejected;
        expect(sdk.middleware.getCircuitBreaker('myOpenHandler2')).to.be.rejected;
        expect(sdk.middleware.getCors('corsOrigin2')).to.be.rejected;
        expect(sdk.middleware.getErrorHandler('errorHandler2')).to.be.rejected;
        expect(sdk.middleware.getThrottlingKeyGenerator('myKeyGen2')).to.be.rejected;
        expect(sdk.middleware.getThrottlingSkip('mySkip2')).to.be.rejected;
        expect(sdk.middleware.getThrottlingHandler('myHandler2')).to.be.rejected;
    });

    let installedApis: Array<ApiConfig>;
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
        installedApis = await Promise.all(promises);
        promises = installedApis.map(apiConfig => sdk.apis.addApi(apiConfig));
        const apiIds = await Promise.all(promises);

        apiIds.forEach((apiId: string, index: number) => {
            installedApis[index].id = apiId;
        });

        await timeout(1000);
    });

    it('should be able to handle duplications when installing APIs', async () => {
        const promises = installedApis.map(apiConfig => sdk.apis.addApi(apiConfig));
        expect(Promise.all(promises)).to.be.rejected;
        await timeout(1000);
    });

    it('should be able to update APIs', async () => {
        const promises = installedApis.map(apiConfig => sdk.apis.updateApi(apiConfig.id, apiConfig));
        expect(Promise.all(promises)).to.be.fulfilled;
        await timeout(1000);
    });

    it('should be able to read APIs', async () => {
        const promises = installedApis.map(apiConfig => sdk.apis.getApi(apiConfig.id));
        expect(Promise.all(promises)).to.be.fulfilled;
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
            expect(err.code).to.eq(403);
            expect(err.message).to.eq('Invalid API Id INVALID_ID. The Id must be a valid ObjectID. To skip this validation, configure the \'disableApiIdValidation\' property on tree-gateway.yml config file.');
        }
    });

    let conf: ConfigPackage;

    it('should be able to export Gateway Configuration', async () => {
        conf = await sdk.config.get();
        expect(conf.middlewares.length).to.eq(18);
    });

    it('should be able to import Gateway Configuration', async () => {
        await sdk.config.set(conf);
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
