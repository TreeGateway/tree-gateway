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
import {ApiConfig, validateApiConfig} from '../../src/config/api';

const expect = chai.expect;
// tslint:disable:no-unused-expression
// tslint:disable:no-console

let config: Configuration;
let database: Database;
let gateway: Gateway;
let gatewayRequest: any;
let adminRequest: any;
let configToken: string;

const configUser = {
    email: 'test@mail.com',
    login: 'config',
    name: 'Config user',
    password: '123test',
    roles: ['tree-gateway-config']
};

const createUser = () => {
    return new Promise<void>((resolve, reject) => {
        const userService = Container.get(UserService);
        userService.create(configUser)
        .then(resolve)
        .catch(reject);
    });
};

const authenticate = () => {
    return new Promise<void>((resolve, reject) => {
        const form = {
            'login': 'config',
            'password': '123test'
        };
        adminRequest.post('/users/authentication',{
            form: form
        }, (error: any, response: any, body: any) => {
            if (error) {
                return reject(error);
            }
            configToken = body;
            resolve();
        });
    });
};

const getIdFromResponse = (response: any) => {
    const location = response.headers['location'];
    expect(location).to.exist;
    const parts = location ? location.split('/') : [];
    return parts.length > 0 ? parts[parts.length-1] : null;
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
        return database.redisClient.flushdb()
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
            database = Container.get(Database);
            gateway = Container.get(Gateway);
            gateway.start()
            .then(() => {
                return gateway.startAdmin();
            })
            .then(() => {
                gateway.server.set('env', 'test');
                gatewayRequest = request.defaults({baseUrl: `http://localhost:${config.gateway.protocol.http.listenPort}`});
                adminRequest = request.defaults({baseUrl: `http://localhost:${config.gateway.admin.protocol.http.listenPort}`});

                return database.redisClient.flushdb();
            })
            .then(() => {
                return createUser();
            })
            .then(() => {
                return authenticate();
            })
            .then(() => {
                return installMiddlewares();
            })
            .then(() => {
                return installApis();
            })
            .then(resolve)
            .catch(reject);
        });
    }

    function installApis(): Promise<void> {
         return new Promise<void>((resolve, reject) => {
            const pathApi = './test/data/apis/';

            fs.readdirAsync(pathApi)
                .then((files) => {
                    const promises = files.map(file => fs.readJsonAsync(pathApi+file));
                    return Promise.all(promises);
                })
                .then((apis: any[]) => {
                    const promises = apis.map(apiConfig => installApi(apiConfig));

                    return Promise.all(promises);
                })
                .then(() => {
                    setTimeout(resolve, 1000);
                })
                .catch(reject);
        });
    }

    function installApi(apiConfig: ApiConfig): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            validateApiConfig(apiConfig).
            then(api => {
                adminRequest.post('/apis', {
                    body: apiConfig,
                    headers: { 'authorization': `JWT ${configToken}` },
                    json: true
                }, (error: any, response: any, body: any) => {
                    expect(error).to.not.exist;
                    expect(response.statusCode).to.equal(201);
                    apiConfig.id = getIdFromResponse(response);
                    return resolve();
                });
            })
            .catch(err => {
                console.log(`Invalild api config: ${JSON.stringify(apiConfig)}`);
                console.log(err);
                reject(err);
            });
        });
    }

    function installMiddleware(fileName: string, servicePath: string, dir: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const pathMiddleware = './test/data/middleware/';
            const filePath = path.join(pathMiddleware, dir, fileName+'.js');

            const req = adminRequest.post('/middleware'+servicePath, {
                headers: { 'authorization': `JWT ${configToken}` }
            }, (error: any, response: any, body: any) => {
                if (error) {
                    return reject(error);
                }
                if (response.statusCode === 201) {
                    return resolve();
                }
                return reject(`Status code: ${response.statusCode}`);
            });
            const form: FormData = req.form();
            form.append('name', fileName);
            form.append('file', <any>fs.createReadStream(filePath), fileName+'.js');
        });
    }

    function installMiddlewares(): Promise<void> {
         return new Promise<void>((resolve, reject) => {
             installMiddleware('myJwtStrategy', '/authentication/strategies/', '/authentication/strategy')
             .then(() => {
                 return installMiddleware('verifyBasicUser', '/authentication/verify/', '/authentication/verify');
             })
             .then(() => {
                 return installMiddleware('verifyJwtUser', '/authentication/verify/', '/authentication/verify');
             })
             .then(() => {
                 return installMiddleware('myCustomFilter', '/filters', '/filter');
             })
             .then(() => {
                 return installMiddleware('mySecondFilter', '/filters', '/filter');
             })
             .then(() => {
                 return installMiddleware('myRequestInterceptor', '/interceptors/request', '/interceptor/request');
             })
             .then(() => {
                 return installMiddleware('mySecondRequestInterceptor', '/interceptors/request', '/interceptor/request');
             })
             .then(() => {
                 return installMiddleware('myResponseInterceptor', '/interceptors/response', '/interceptor/response');
             })
             .then(() => {
                 return installMiddleware('SecondInterceptor', '/interceptors/response', '/interceptor/response');
             })
             .then(() => {
                 return installMiddleware('myOpenHandler', '/circuitbreaker', '/circuitbreaker');
             })
             .then(() => {
                 setTimeout(resolve, 1500);
             })
             .catch(reject);
        });
    }
});
