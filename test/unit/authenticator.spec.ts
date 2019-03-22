'use strict';

import * as chai from 'chai';
import 'mocha';

import * as request from 'request';
import { Cookie } from 'tough-cookie';
import { Container } from 'typescript-ioc';
import { Configuration } from '../../src/configuration';

const expect = chai.expect;
// tslint:disable:no-unused-expression
// tslint:disable:no-console

let gatewayRequest: any;
let config: Configuration;

describe('The Gateway Authenticator', () => {
    before(() => {
        config = Container.get(Configuration);
        gatewayRequest = request.defaults({ baseUrl: `http://localhost:${config.gateway.protocol.http.listenPort}` });

    });

    it('should be able deny request without authentication', (done) => {
        gatewayRequest('/secure/get?arg=1', (error: any, response: any, body: any) => {
            expect(response.statusCode).to.equal(401);
            const contentType = response.headers['content-type'];
            expect(contentType).to.equal('text/html; charset=utf-8');
            expect(body).to.equal('<html><head></head><body>Error: Unauthorized</body></html>');
            done();
        });
    });

    it('should be able to verify JWT authentication on requests to API', (done) => {
        gatewayRequest.get({
            headers: { 'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ' },
            url: '/secure/get?arg=1'
        }, (error: any, response: any, body: any) => {
            expect(response.statusCode).to.equal(200);
            const result = JSON.parse(body);
            expect(result.args.arg).to.equal('1');
            done();
        });
    });

    it('should be able to verify JWT authentication on requests to API via query param', (done) => {
        gatewayRequest.get({
            url: '/secure/get?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ'
        }, (error: any, response: any, body: any) => {
            expect(response.statusCode).to.equal(200);
            const result = JSON.parse(body);
            expect(result.args.jwt).to.exist;
            done();
        });
    });

    it('should be able to verify JWT authentication on requests to API via custom header', (done) => {
        gatewayRequest.get({
            headers: { 'x-my-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ' },
            url: '/secure/get'
        }, (error: any, response: any, body: any) => {
            expect(response.statusCode).to.equal(200);
            done();
        });
    });

    it('should be able to verify JWT authentication on requests to API via custom cookie', (done) => {
        const cookie = new Cookie({
            key: 'my-cookie',
            value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ'
        });
        const jar = gatewayRequest.jar();
        jar.setCookie(cookie.cookieString(), 'http://localhost:8001');
        gatewayRequest.get({
            jar: jar,
            url: '/secure/get'
        }, (error: any, response: any, body: any) => {
            expect(response.statusCode).to.equal(200);
            done();
        });
    });

    it('should be able to verify Basic authentication on requests to API', (done) => {
        gatewayRequest.get({
            headers: { 'authorization': 'Basic dGVzdDp0ZXN0MTIz' },
            url: '/secureBasic/get?arg=1'
        }, (error: any, response: any, body: any) => {
            expect(response.statusCode).to.equal(200);
            const result = JSON.parse(body);
            expect(result.args.arg).to.equal('1');
            done();
        });
    });

    it('should be able to verify authentication only to restricted groups in API', (done) => {
        gatewayRequest.get({
            url: '/secureBasic-by-group/get?arg=1'
        }, (error: any, response: any, body: any) => {
            expect(response.statusCode).to.equal(401);
            const result = JSON.parse(body);
            expect(result.Err).to.equal('Unauthorized');
            done();
        });
    });

    it('should be able to verify authentication only to restricted groups in API', (done) => {
        gatewayRequest.get({
            url: '/secureBasic-by-group/headers'
        }, (error: any, response: any, body: any) => {
            expect(response.statusCode).to.equal(200);
            done();
        });
    });

    it('should be able to verify authentication only to restricted groups in API with multiple paths', (done) => {
        gatewayRequest.get({
            url: '/secureBasic-by-group-multi/get?arg=1'
        }, (error: any, response: any, body: any) => {
            expect(response.statusCode).to.equal(401);
            const result = JSON.parse(body);
            expect(result.Err).to.equal('Unauthorized');
            done();
        });
    });

    it('should be able to verify authentication only to restricted groups in API with multiple paths', (done) => {
        gatewayRequest.get({
            url: '/secureBasic-by-group-multi/headers'
        }, (error: any, response: any, body: any) => {
            expect(response.statusCode).to.equal(200);
            done();
        });
    });

    it('should be able to verify Local authentication on requests to API', (done) => {
        gatewayRequest.get({
            url: '/secureLocal/get?userid=test&passwd=test123'
        }, (error: any, response: any, body: any) => {
            expect(response.statusCode).to.equal(200);
            const result = JSON.parse(body);
            expect(result.args.userid).to.equal('test');
            done();
        });
    });

    it('should be able to verify a custom authentication on requests to API', (done) => {
        gatewayRequest.get({
            url: '/secureCustom/get?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ'
        }, (error: any, response: any, body: any) => {
            expect(response.statusCode).to.equal(200);
            const result = JSON.parse(body);
            expect(result.args.jwt).to.exist;
            done();
        });
    });

    it('should be able to verify a custom authentication on requests to API', (done) => {
        gatewayRequest.get({
            url: '/secureCustom/get'
        }, (error: any, response: any, body: any) => {
            expect(response.statusCode).to.equal(401);
            done();
        });
    });
});
