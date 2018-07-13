'use strict';

import 'mocha';

import * as chai from 'chai';
import * as request from 'request';
import { Container } from 'typescript-ioc';
import { Configuration } from '../../src/configuration';

const expect = chai.expect;
// tslint:disable:no-unused-expression
// tslint:disable:no-console

let gatewayRequest: any;
let config: Configuration;

describe('The Gateway Limit Controller', () => {
    before(() => {
        config = Container.get(Configuration);
        gatewayRequest = request.defaults({ baseUrl: `http://localhost:${config.gateway.protocol.http.listenPort}` });
    });

    it('should be able to limit the requests to API', (done) => {
        gatewayRequest('/limited/get?arg=1', (error: any, response: any, body: any) => {
            expect(response.statusCode).to.equal(200);
            const result = JSON.parse(body);
            expect(result.args.arg).to.equal('1');
            gatewayRequest('/limited/get?arg=1', (err: any, resp: any, bod: any) => {
                expect(resp.statusCode).to.equal(429);
                const b = JSON.parse(bod);
                expect(b.error).to.equal('Too many requests, please try again later.');
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
                const b = JSON.parse(bod);
                expect(b.error).to.equal('Too many requests, please try again later.');
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
});
