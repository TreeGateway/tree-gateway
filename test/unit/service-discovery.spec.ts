'use strict';

import * as chai from 'chai';
import 'mocha';

import * as request from 'request';
import {Container} from 'typescript-ioc';
import {Configuration} from '../../src/configuration';
import {ConsulTestService} from '../data/services/consulTestService';
import {SecondConsulTestService} from '../data/services/secondConsulTestService';

const expect = chai.expect;
// tslint:disable:no-unused-expression
// tslint:disable:no-console

let gatewayRequest: any;
let config: Configuration;
let consulTestService: ConsulTestService;
let secondConsultestService: SecondConsulTestService;

describe('Gateway Service Discovery', () => {
    describe('Consul Service Discovery Provider', () => {
        before((done) => {
            config = Container.get(Configuration);
            gatewayRequest = request.defaults({baseUrl: `http://localhost:${config.gateway.protocol.http.listenPort}`});
            const consulHost = config.gateway.serviceDiscovery.provider[0].options.host;
            const consulPort = config.gateway.serviceDiscovery.provider[0].options.port;
            consulTestService = new ConsulTestService(consulHost, consulPort);
            secondConsultestService = new SecondConsulTestService(consulHost, consulPort);
            Promise.all([consulTestService.start(), secondConsultestService.start()])
            .then(() => {
                setTimeout(done, 10000); // Give time to services register and perform a health check.
            });
        });

        after(() => {
            consulTestService.stop();
            secondConsultestService.stop();
        });

        it('should be able to call a consul service declared on api middleware', (done) => {
            gatewayRequest('/serviceDiscoveryConsul', (error: any, response: any, body: any) => {
                expect(response.statusCode).to.equal(200);
                const result = JSON.parse(body);
                expect(result.data).to.equal('service data');
                done();
            });
        });

        it('should be able to call a consul service provided by a router middleware', (done) => {
            gatewayRequest('/serviceDiscoveryConsulMiddleware?apiVersion=2', (error: any, response: any, body: any) => {
                expect(response.statusCode).to.equal(200);
                const result = JSON.parse(body);
                expect(result.data).to.equal('service data 2');
                done();
            });
        });

        it('should return 503 if no valid instance is present in consul', (done) => {
            gatewayRequest('/invalidServiceDiscoveryConsul', (error: any, response: any, body: any) => {
                expect(response.statusCode).to.equal(503);
                done();
            });
        });
    });
});
