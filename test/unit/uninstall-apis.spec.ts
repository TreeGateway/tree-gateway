'use strict';

import 'mocha';

import * as fs from 'fs-extra-promise';
import * as path from 'path';
import {Container} from 'typescript-ioc';
import {Configuration} from '../../src/configuration';
import {Gateway} from '../../src/gateway';
import {Database} from '../../src/database';
import {SDK} from '../../src/admin/config/sdk';

// tslint:disable:no-unused-expression
// tslint:disable:no-console

let config: Configuration;
let database: Database;
let gateway: Gateway;
let sdk: SDK = null;

describe('Gateway APIs uninstall', () => {
    before(() => {
        config = Container.get(Configuration);
        database = Container.get(Database);
        gateway = Container.get(Gateway);

        return new Promise((resolve, reject) => {
            SDK.initialize(config.gateway)
                .then((s) => {
                    sdk = s;
                    resolve();
                })
                .catch(reject);
        });
    });

    it('should be able to uninstall APIs', () => {
         return new Promise<void>((resolve, reject) => {
                sdk.apis.list({})
                    .then(apiConfigs => {
                        const promises = apiConfigs.map(api => sdk.apis.removeApi(api.id));
                        return Promise.all(promises);
                    })
                    .then(() => resolve())
                    .catch(reject);
        });
    });

    it('should be able to uninstall Middlewares', () => {
         return new Promise<void>((resolve, reject) => {
             sdk.middleware.removeAuthStrategy('myJwtStrategy')
             .then(() => sdk.middleware.removeAuthVerify('verifyBasicUser'))
             .then(() => sdk.middleware.removeAuthVerify('verifyJwtUser'))
             .then(() => sdk.middleware.removeFilter('myCustomFilter'))
             .then(() => sdk.middleware.removeFilter('mySecondFilter'))
             .then(() => sdk.middleware.removeRequestInterceptor('myRequestInterceptor'))
             .then(() => sdk.middleware.removeRequestInterceptor('mySecondRequestInterceptor'))
             .then(() => sdk.middleware.removeRequestInterceptor('changeBodyInterceptor'))
             .then(() => sdk.middleware.removeResponseInterceptor('myResponseInterceptor'))
             .then(() => sdk.middleware.removeResponseInterceptor('SecondInterceptor'))
             .then(() => sdk.middleware.removeResponseInterceptor('changeBodyResponseInterceptor'))
             .then(() => sdk.middleware.removeResponseInterceptor('removeHeaderResponseInterceptor'))
             .then(() => sdk.middleware.removeCircuitBreaker('myOpenHandler'))
             .then(() => sdk.middleware.removeCors('corsOrigin'))
             .then(() => {
                 setTimeout(resolve, 1500);
             })
             .catch(reject);
        });
    });

    after(function(){
        return database.redisClient.flushdb()
            .then(() => gateway.stopAdmin())
            .then(() => gateway.stop())
            .then(() => fs.removeAsync(path.join(process.cwd(), 'test', 'data', 'root', 'middleware')))
            .then(() => fs.removeAsync(path.join(process.cwd(), 'test', 'data', 'root', 'logs')))
            .then(() => database.disconnect());
    });
});
