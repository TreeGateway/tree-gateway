'use strict';

import 'mocha';
import * as chai from 'chai';

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

const expect = chai.expect;
// tslint:disable:no-unused-expression
// tslint:disable:no-console

let config: Configuration;
let database: Database;
let gateway: Gateway;
let gatewayRequest: any;
let sdk: SDK = null;
let loadedApis: string[];

const configUser = {
    email: 'test@mail.com',
    login: 'config',
    name: 'Config user',
    password: '123test',
    roles: ['tree-gateway-admin', 'tree-gateway-config']
};

const createUser = () => {
    return new Promise<{login: string, password: string}>((resolve, reject) => {
        const userService = Container.get(UserService);
        userService.create(configUser)
        .then(() => resolve(configUser))
        .catch(reject);
    });
};

describe('Gateway Tests', () => {
    before(function(){
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

    after(function(){
        return uninstallApis()
            .then(() => uninstallMiddlewares())
            .then(database.redisClient.flushdb())
            .then(() => gateway.stopAdmin())
            .then(() => gateway.stop())
            .then(() => fs.removeAsync(path.join(process.cwd(), 'test', 'data', 'root', 'middleware')))
            .then(() => fs.removeAsync(path.join(process.cwd(), 'test', 'data', 'root', 'logs')))
            .then(() => database.disconnect());
    });

    describe('The Gateway Proxy', () => {
        it('should be able to proxy an API', (done) => {
            gatewayRequest('/test/get?arg=1', (error: any, response: any, body: any) => {
                expect(response.statusCode).to.equal(200);
                expect(body).to.exist;
                const result = JSON.parse(body);
                expect(result.args.arg).to.equal('1');
                done();
            });
        });
        it('should be able to filter requests by method', (done) => {
            gatewayRequest('/test/post', (error: any, response: any, body: any) => {
                expect(response.statusCode).to.equal(405);
                done();
            });
        });
        it('should be able to send post requests', (done) => {
            gatewayRequest.post({
                body: {test: 'test123'},
                json: true,
                url: '/simple/post'
            }, (error: any, response: any, body: any) => {
                expect(response.statusCode).to.equal(200);
                done();
            });
        });
        it('should be able to send post requests with interceptors', (done) => {
            gatewayRequest.post({
                body: {test: 'test123'},
                json: true,
                url: '/hasbody/post'
            }, (error: any, response: any, body: any) => {
                expect(response.statusCode).to.equal(200);
                expect(body.headers['X-Proxied-By']).to.equal('Tree-Gateway');
                expect(body.headers['X-Proxied-2-By']).to.equal('Tree-Gateway');
                expect(response.headers['via']).to.equal('previous Interceptor wrote: Changed By Tree-Gateway, 1.1 Tree-Gateway');
                const bodyData = JSON.parse(body.data);
                expect(bodyData.test).to.equal('test123');
                expect(bodyData.insertedProperty).to.equal('newProperty');
                expect(body.changedByResponseInterceptor).to.equal('changed');
                done();
            });
        });
        it('should be able to send post requests with interceptors that remove headers', (done) => {
            gatewayRequest.post({
                body: {test: 'test123'},
                json: true,
                url: '/removeheader/post'
            }, (error: any, response: any, body: any) => {
                expect(response.statusCode).to.equal(200);
                expect(body.headers['X-Proxied-By']).to.equal('Tree-Gateway');
                expect(body.headers['X-Proxied-2-By']).to.equal('Tree-Gateway');
                expect(response.headers).to.not.have.property('via');
                const bodyData = JSON.parse(body.data);
                expect(bodyData.test).to.equal('test123');
                expect(bodyData.insertedProperty).to.equal('newProperty');
                expect(body.changedByResponseInterceptor).to.equal('changed');
                done();
            });
        });
        it('should be able to filter requests by path', (done) => {
            gatewayRequest('/test/user-agent', (error: any, response: any, body: any) => {
                expect(response.statusCode).to.equal(404);
                done();
            });
        });
        it('should be able to filter requests with custom filters', (done) => {
            gatewayRequest('/filtered/get', (error: any, response: any, body: any) => {
                expect(response.statusCode).to.equal(200);
                gatewayRequest('/filtered/user-agent', (err: any, resp: any, bod: any) => {
                    expect(resp.statusCode).to.equal(404);
                    gatewayRequest('/filtered/get?denyParam=1', (e: any, r: any, b: any) => {
                        expect(r.statusCode).to.equal(404);
                        done();
                    });
                });
            });
        });
        it('should be able to route requests with trafficSplit router', (done) => {
            gatewayRequest('/trafficSplit/get', (error: any, response: any, body: any) => {
                expect(response.statusCode).to.equal(200);
                done();
            });
        });
        it('should be able to route requests with querySplit router', (done) => {
            gatewayRequest('/querySplit/get', (error: any, response: any, body: any) => {
                expect(response.statusCode).to.equal(200);
                const result = JSON.parse(body);
                expect(result.url).to.equal('http://httpbin.org/get');
                gatewayRequest('/querySplit/get?apiVersion=2', (err: any, res: any, b: any) => {
                    expect(res.statusCode).to.equal(200);
                    const result2 = JSON.parse(b);
                    expect(result2.url).to.equal('http://httpbin.org/anything/get?apiVersion=2');
                    done();
                });
            });
        });
        it('should be able to route requests with headerSplit router', (done) => {
            gatewayRequest('/headerSplit/get', (error: any, response: any, body: any) => {
                expect(response.statusCode).to.equal(200);
                const result = JSON.parse(body);
                expect(result.url).to.equal('http://httpbin.org/get');
                gatewayRequest.get({
                    headers: { 'authorization': '2' },
                    url: '/headerSplit/get'
                }, (err: any, res: any, b: any) => {
                    expect(res.statusCode).to.equal(200);
                    const result2 = JSON.parse(b);
                    expect(result2.url).to.equal('http://httpbin.org/anything/get');
                    done();
                });
            });
        });
        it('should be able to filter IPs', (done) => {
            gatewayRequest.post({
                body: {test: 'test123'},
                json: true,
                url: '/filtered/post'
            }, (error: any, response: any, body: any) => {
                expect(response.statusCode).to.equal(403);
                expect(body).to.equal('IP Filtered');
                done();
            });
        });

        it('should be able to intercept requests ', (done) => {
            gatewayRequest('/intercepted/get', (error: any, response: any, body: any) => {
                expect(response.statusCode).to.equal(200);
                const result = JSON.parse(body);
                expect(result.headers['X-Proxied-By']).to.equal('Tree-Gateway');
                expect(result.headers['X-Proxied-2-By']).to.equal('Tree-Gateway');
                done();
            });
        });
        it('should be able to intercept requests with applies filter', (done) => {
            gatewayRequest('/intercepted/headers', (error: any, response: any, body: any) => {
                expect(response.statusCode).to.equal(200);
                const result = JSON.parse(body);
                expect(result.headers['X-Proxied-2-By']).to.equal('Tree-Gateway');
                done();
            });
        });
        it('should be able to intercept responses ', (done) => {
            gatewayRequest('/intercepted/get', (error: any, response: any, body: any) => {
                expect(response.statusCode).to.equal(200);
                expect(response.headers['via']).to.equal('previous Interceptor wrote: Changed By Tree-Gateway, 1.1 Tree-Gateway');
                done();
            });
        });
        it('should be able to intercept responses with applies filter', (done) => {
            gatewayRequest('/intercepted/headers', (error: any, response: any, body: any) => {
                expect(response.statusCode).to.equal(200);
                expect(response.headers['via']).to.equal('Changed By Tree-Gateway, 1.1 Tree-Gateway');
                done();
            });
        });
        it('should be able to intercept responses with default middlewares', (done) => {
            gatewayRequest('/interceptedByDefault/get?arg1=1&param2=2', (error: any, response: any, body: any) => {
                expect(response.statusCode).to.equal(200);
                const result = JSON.parse(body);
                expect(result.argumentNames).to.have.length(2);
                expect(result.argumentNames[0]).to.equal('param2');
                expect(result.argumentNames[1]).to.equal('arg1');
                done();
            });
        });
        it('should be able to intercept requests with default middlewares', (done) => {
            gatewayRequest.post({
                body: {test: 'test123'},
                json: true,
                url: '/interceptedByDefault/post'
            }, (error: any, response: any, body: any) => {
                expect(response.statusCode).to.equal(200);
                const result = JSON.parse(body.data);
                expect(result.test).to.eq('test123');
                done();
            });
        });
    });

    describe('The Gateway Limit Controller', () => {
        it('should be able to limit the requests to API', (done) => {
            gatewayRequest('/limited/get?arg=1', (error: any, response: any, body: any) => {
                expect(response.statusCode).to.equal(200);
                const result = JSON.parse(body);
                expect(result.args.arg).to.equal('1');
                gatewayRequest('/limited/get?arg=1', (err: any, resp: any, bod: any) => {
                    expect(resp.statusCode).to.equal(429);
                    expect(bod).to.equal('Too many requests, please try again later.');
                    done();
                });
            });
        });
        it('should be able to restict the limit to an API Group', (done) => {
            gatewayRequest('/limited-by-group/get?arg=1', (error: any, response: any, body: any) => {
                const result = JSON.parse(body);
                expect(result.args.arg).to.equal('1');
                gatewayRequest('/limited-by-group/get?arg=1', (err: any, resp: any, bod: any) => {
                    expect(resp.statusCode).to.equal(429);
                    expect(bod).to.equal('Too many requests, please try again later.');
                    done();
                });
            });
        });
        it('should be able to restict the limit to an API Group', (done) => {
            gatewayRequest('/limited-by-group/headers', (error: any, response: any, body: any) => {
                expect(response.statusCode).to.equal(200);
                gatewayRequest('/limited-by-group/headers', (err: any, resp: any, bod: any) => {
                    expect(resp.statusCode).to.equal(200);
                    done();
                });
            });
        });
        it('should be able to break the circuit to slow apis', (done) => {
            gatewayRequest('/circuitbreaker/get', (error: any, response: any, body: any) => {
                expect(response.statusCode).to.equal(504);
                gatewayRequest('/circuitbreaker/get', (err: any, resp: any, bod: any) => {
                    expect(resp.statusCode).to.equal(503);
                    done();
                });
            });
        });
    });

    describe('The Gateway Cors', () => {
        it('should be able to accept cors requests', (done) => {
            gatewayRequest('/cors/get', (error: any, response: any, body: any) => {
                expect(response.statusCode).to.equal(200);
                done();
            });
        });

        it('should be able to accept cors requests verified by middleware', (done) => {
            gatewayRequest('/cors-middleware/get', (error: any, response: any, body: any) => {
                expect(response.statusCode).to.equal(200);
                done();
            });
        });
    });

    describe('The Gateway Authenticator', () => {
        it('should be able deny request without authentication', (done) => {
            gatewayRequest('/secure/get?arg=1', (error: any, response: any, body: any) => {
                expect(response.statusCode).to.equal(401);
                done();
            });
        });

        it('should be able to verify JWT authentication on requests to API', (done) => {
            gatewayRequest.get({
                headers: { 'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ' },
                url:'/secure/get?arg=1'
            }, (error: any, response: any, body: any) => {
                expect(response.statusCode).to.equal(200);
                const result = JSON.parse(body);
                expect(result.args.arg).to.equal('1');
                done();
            });
        });

        it('should be able to verify JWT authentication on requests to API via query param', (done) => {
            gatewayRequest.get({
                url:'/secure/get?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ'
            }, (error: any, response: any, body: any) => {
                expect(response.statusCode).to.equal(200);
                const result = JSON.parse(body);
                expect(result.args.jwt).to.exist;
                done();
            });
        });

        it('should be able to verify Basic authentication on requests to API', (done) => {
            gatewayRequest.get({
                headers: { 'authorization': 'Basic dGVzdDp0ZXN0MTIz' },
                url:'/secureBasic/get?arg=1'
            }, (error: any, response: any, body: any) => {
                expect(response.statusCode).to.equal(200);
                const result = JSON.parse(body);
                expect(result.args.arg).to.equal('1');
                done();
            });
        });

        it('should be able to verify authentication only to restricted groups in API', (done) => {
            gatewayRequest.get({
                url:'/secureBasic-by-group/get?arg=1'
            }, (error: any, response: any, body: any) => {
                expect(response.statusCode).to.equal(401);
                done();
            });
        });

        it('should be able to verify authentication only to restricted groups in API', (done) => {
            gatewayRequest.get({
                url:'/secureBasic-by-group/headers'
            }, (error: any, response: any, body: any) => {
                expect(response.statusCode).to.equal(200);
                done();
            });
        });

        it('should be able to verify Local authentication on requests to API', (done) => {
            gatewayRequest.get({
                url:'/secureLocal/get?userid=test&passwd=test123'
            }, (error: any, response: any, body: any) => {
                expect(response.statusCode).to.equal(200);
                const result = JSON.parse(body);
                expect(result.args.userid).to.equal('test');
                done();
            });
        });

        it('should be able to verify a custom authentication on requests to API', (done) => {
            gatewayRequest.get({
                url:'/secureCustom/get?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ'
            }, (error: any, response: any, body: any) => {
                expect(response.statusCode).to.equal(200);
                const result = JSON.parse(body);
                expect(result.args.jwt).to.exist;
                done();
            });
        });
    });

    describe('The Gateway Cache', () => {
        it('should be able to cache request on client', (done) => {
            gatewayRequest('/testCache/get', (error: any, response: any, body: any) => {
                expect(response.statusCode).to.equal(200);
                expect(response.headers['cache-control']).to.equal('public,max-age=60');
                done();
            });
        });

        it('should be able to preserve headers on requests from server cache', (done) => {
            gatewayRequest('/testCache/get', (error: any, response: any, body: any) => {
                expect(response.statusCode).to.equal(200);
                expect(response.headers['access-control-allow-credentials']).to.equal('true');
                done();
            });
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
            .then((user) => SDK.initialize(swaggerUrl, 'config', '123test'))
            .then((s) => {
                sdk = s;
                return installMiddlewares();
            })
            .then(() => installApis())
            .then(resolve)
            .catch(reject);
        });
    }

    function installApis(): Promise<void> {
         return new Promise<void>((resolve, reject) => {
            const pathApi = './test/data/apis/';

            fs.readdirAsync(pathApi)
                .then((files) => {
                    const promises = files.map(file => {
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
    }

    function uninstallApis(): Promise<void> {
         return new Promise<void>((resolve, reject) => {
                const promises = loadedApis.map(api => sdk.apis.removeApi(api));
                Promise.all(promises)
                .then(() => resolve())
                .catch(reject);
        });
    }

    function installMiddlewares(): Promise<void> {
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
    }

    function uninstallMiddlewares(): Promise<void> {
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
    }
});
