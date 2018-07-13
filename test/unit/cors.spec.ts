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

describe('The Gateway Cors', () => {
    before(() => {
        config = Container.get(Configuration);
        gatewayRequest = request.defaults({baseUrl: `http://localhost:${config.gateway.protocol.http.listenPort}`});

    });

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
