'use strict';

import * as chai from 'chai';
import 'mocha';

import * as request from 'request';
import {Container} from 'typescript-ioc';
import {Configuration} from '../../src/configuration';

const expect = chai.expect;
// tslint:disable:no-unused-expression
// tslint:disable:no-console

let gatewayRequest: any;
let config: Configuration;

describe('The Gateway Proxy', () => {
    before(() => {
        config = Container.get(Configuration);
        gatewayRequest = request.defaults({baseUrl: `http://localhost:${config.gateway.protocol.http.listenPort}`});
    });

    describe('/healthcheck', () => {
        it('should return OK', (done) => {
            gatewayRequest.get('/healthcheck', (error: any, response: any, body: any) => {
                expect(error).to.not.exist;
                expect(response.statusCode).to.equal(200);
                expect(body).to.equal('OK');
                done();
            });
        });
    });

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
            expect(result.url).to.equal('http://localhost/get');
            gatewayRequest('/querySplit/get?apiVersion=2', (err: any, res: any, b: any) => {
                expect(res.statusCode).to.equal(200);
                const result2 = JSON.parse(b);
                expect(result2.url).to.equal('http://localhost/anything/get?apiVersion=2');
                done();
            });
        });
    });
    it('should be able to route requests with headerSplit router', (done) => {
        gatewayRequest('/headerSplit/get', (error: any, response: any, body: any) => {
            expect(response.statusCode).to.equal(200);
            const result = JSON.parse(body);
            expect(result.url).to.equal('http://localhost/get');
            gatewayRequest.get({
                headers: { 'authorization': '2' },
                url: '/headerSplit/get'
            }, (err: any, res: any, b: any) => {
                expect(res.statusCode).to.equal(200);
                const result2 = JSON.parse(b);
                expect(result2.url).to.equal('http://localhost/anything/get');
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
            expect(response.headers['x-xss-protection']).to.equal('1; mode=block');
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
