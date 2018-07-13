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

describe('The Gateway Cache', () => {
    before(() => {
        config = Container.get(Configuration);
        gatewayRequest = request.defaults({baseUrl: `http://localhost:${config.gateway.protocol.http.listenPort}`});

    });

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
