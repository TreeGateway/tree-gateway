'use strict';

import * as chai from 'chai';
import 'mocha';

import * as request from 'request';
import { setTimeout } from 'timers';
import {Container} from 'typescript-ioc';
import {Configuration} from '../../src/configuration';

const expect = chai.expect;
// tslint:disable:no-unused-expression
// tslint:disable:no-console

let gatewayRequest: any;
let config: Configuration;

describe('The Gateway CircuitBreaker', () => {
    before(() => {
        config = Container.get(Configuration);
        gatewayRequest = request.defaults({baseUrl: `http://localhost:${config.gateway.protocol.http.listenPort}`});
    });

    it('should be able to break the circuit to slow apis', (done) => {
        gatewayRequest('/circuitbreaker/get', (error: any, response: any, body: any) => {
            expect(response.statusCode).to.equal(504);
            gatewayRequest('/circuitbreaker/get', (err: any, resp: any, bod: any) => {
                expect(resp.statusCode).to.equal(503);
                setTimeout(() => {
                    gatewayRequest('/circuitbreaker/get', (e: any, r: any, b: any) => {
                        expect(r.statusCode).to.equal(504);
                        done();
                    });
                }, 3001);
            });
        });
    });

    it('should be able to break the circuit considering a timewindow for refreshes', (done) => {
        gatewayRequest('/circuitbreakerTime/get', (error: any, response: any, body: any) => {
            expect(response.statusCode).to.equal(504);
            gatewayRequest('/circuitbreakerTime/get', (err: any, resp: any, bod: any) => {
                expect(resp.statusCode).to.equal(503);
                setTimeout(() => {
                    gatewayRequest('/circuitbreakerTime/get', (e: any, r: any, b: any) => {
                        expect(r.statusCode).to.equal(503);
                        done();
                    });
                }, 2001);
            });
        });
    });
});
