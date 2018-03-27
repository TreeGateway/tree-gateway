'use strict';

import 'mocha';

import * as fs from 'fs-extra-promise';
import * as path from 'path';
import {Container} from 'typescript-ioc';
import {Configuration} from '../../src/configuration';
import {Gateway} from '../../src/gateway';
import {Database} from '../../src/database';
import {SDK} from '../../src/admin/config/sdk';
import { getSwaggerHost, getSwaggerUrl, generateSecurityToken } from '../../src/utils/config';

// tslint:disable:no-unused-expression
// tslint:disable:no-console

let config: Configuration;
let database: Database;
let gateway: Gateway;
let sdk: SDK = null;

describe('Gateway APIs uninstall', () => {
    before(async () => {
        config = Container.get(Configuration);
        database = Container.get(Database);
        gateway = Container.get(Gateway);

        sdk = await SDK.initialize({
            defaultHost: getSwaggerHost(config.gateway),
            swaggerUrl: getSwaggerUrl(config.gateway),
            token: generateSecurityToken(config.gateway)
        });
    });

    it('should be able to uninstall APIs', async () => {
        const apiConfigs = await sdk.apis.list({});
        const promises = apiConfigs.map(api => sdk.apis.removeApi(api.id));
        await Promise.all(promises);
    });

    it('should be able to uninstall Middlewares', async () => {
        await sdk.middleware.removeAuthStrategy('myJwtStrategy');
        await sdk.middleware.removeAuthVerify('verifyBasicUser');
        await sdk.middleware.removeAuthVerify('verifyJwtUser');
        await sdk.middleware.removeFilter('myCustomFilter');
        await sdk.middleware.removeFilter('mySecondFilter');
        await sdk.middleware.removeRequestInterceptor('myRequestInterceptor');
        await sdk.middleware.removeRequestInterceptor('mySecondRequestInterceptor');
        await sdk.middleware.removeRequestInterceptor('changeBodyInterceptor');
        await sdk.middleware.removeResponseInterceptor('myResponseInterceptor');
        await sdk.middleware.removeResponseInterceptor('SecondInterceptor');
        await sdk.middleware.removeResponseInterceptor('changeBodyResponseInterceptor');
        await sdk.middleware.removeResponseInterceptor('removeHeaderResponseInterceptor');
        await sdk.middleware.removeCircuitBreaker('myOpenHandler');
        await sdk.middleware.removeCors('corsOrigin');
        await sdk.middleware.removeErrorHandler('errorHandler');
        await sdk.middleware.removeThrottlingKeyGenerator('myKeyGen');
        await sdk.middleware.removeThrottlingSkip('mySkip');
        await sdk.middleware.removeThrottlingHandler('myHandler');
        await timeout(1500);
    });

    after(async () => {
        await database.redisClient.flushdb();
        await gateway.stopAdmin();
        await gateway.stop();
        await fs.removeAsync(path.join(process.cwd(), 'test', 'data', 'root', 'middleware'));
        await fs.removeAsync(path.join(process.cwd(), 'test', 'data', 'root', 'logs'));
        database.disconnect();
    });

    function timeout(ms: number) {
        return new Promise<void>(resolve => setTimeout(resolve, ms));
    }
});
