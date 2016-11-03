"use strict";
var express = require("express");
var request = require("request");
require("jasmine");
var gateway_1 = require("../lib/gateway");
var settings_1 = require("../lib/settings");
var typescript_ioc_1 = require("typescript-ioc");
var provider = {
    get: function () {
        var settings = new settings_1.Settings();
        settings.app = express();
        settings.apiPath = __dirname + '/../../../apis';
        settings.middlewarePath = __dirname + '/../../../middleware';
        return settings;
    }
};
typescript_ioc_1.Container.bind(settings_1.Settings).provider(provider);
var gateway = typescript_ioc_1.Container.get(gateway_1.Gateway);
var app = gateway.server;
var port = 4568;
var gatewayAddress = "http://localhost:" + port;
var server;
app.set('env', 'test');
describe("Gateway Tests", function () {
    beforeAll(function (done) {
        console.log('\nInitializing gateway...');
        gateway.initialize(function () {
            console.log('Gateway configured');
            server = app.listen(port, function () {
                console.log('Gateway started');
                done();
            });
        });
    });
    afterAll(function () {
        server.close();
    });
    describe("The Gateway Proxy", function () {
        it("should be able to proxy an API", function (done) {
            request(gatewayAddress + "/test/get?arg=1", function (error, response, body) {
                var result = JSON.parse(body);
                expect(result.args.arg).toEqual("1");
                done();
            });
        });
        it("should be able to filter requests by method", function (done) {
            request(gatewayAddress + "/test/post", function (error, response, body) {
                expect(response.statusCode).toEqual(405);
                done();
            });
        });
        it("should be able to filter requests by path", function (done) {
            request(gatewayAddress + "/test/user-agent", function (error, response, body) {
                expect(response.statusCode).toEqual(404);
                done();
            });
        });
        it("should be able to filter requests with custom filters", function (done) {
            request(gatewayAddress + "/filtered/get", function (error, response, body) {
                expect(response.statusCode).toEqual(200);
                request(gatewayAddress + "/filtered/user-agent", function (error, response, body) {
                    expect(response.statusCode).toEqual(404);
                    request(gatewayAddress + "/filtered/get?denyParam=1", function (error, response, body) {
                        expect(response.statusCode).toEqual(404);
                        done();
                    });
                });
            });
        });
        it("should be able to intercept requests ", function (done) {
            request(gatewayAddress + "/intercepted/get", function (error, response, body) {
                expect(response.statusCode).toEqual(200);
                var result = JSON.parse(body);
                expect(result.headers['X-Proxied-By']).toEqual("Tree-Gateway");
                expect(result.headers['X-Proxied-2-By']).toEqual("Tree-Gateway");
                done();
            });
        });
        it("should be able to intercept requests with applies filter", function (done) {
            request(gatewayAddress + "/intercepted/headers", function (error, response, body) {
                expect(response.statusCode).toEqual(200);
                var result = JSON.parse(body);
                expect(result.headers['X-Proxied-2-By']).toEqual("Tree-Gateway");
                done();
            });
        });
        it("should be able to intercept responses ", function (done) {
            request(gatewayAddress + "/intercepted/get", function (error, response, body) {
                expect(response.statusCode).toEqual(200);
                var result = JSON.parse(body);
                expect(response.headers['via']).toEqual("previous Interceptor wrote: Changed By Tree-Gateway");
                done();
            });
        });
        it("should be able to intercept responses with applies filter", function (done) {
            request(gatewayAddress + "/intercepted/headers", function (error, response, body) {
                expect(response.statusCode).toEqual(200);
                var result = JSON.parse(body);
                expect(response.headers['via']).toEqual("Changed By Tree-Gateway");
                done();
            });
        });
    });
    describe("The Gateway Limit Controller", function () {
        it("should be able to limit the requests to API", function (done) {
            request(gatewayAddress + "/limited/get?arg=1", function (error, response, body) {
                var result = JSON.parse(body);
                expect(result.args.arg).toEqual("1");
                request(gatewayAddress + "/limited/get?arg=1", function (error, response, body) {
                    expect(response.statusCode).toEqual(429);
                    expect(body).toEqual("Too many requests, please try again later.");
                    done();
                });
            });
        });
    });
    describe("The Gateway Authenticator", function () {
        it("should be able deny request without authentication", function (done) {
            request(gatewayAddress + "/secure/get?arg=1", function (error, response, body) {
                expect(response.statusCode).toEqual(401);
                done();
            });
        });
        it("should be able to verify JWT authentication on requests to API", function (done) {
            request.get({
                headers: { 'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ' },
                url: gatewayAddress + "/secure/get?arg=1"
            }, function (error, response, body) {
                expect(response.statusCode).toEqual(200);
                var result = JSON.parse(body);
                expect(result.args.arg).toEqual("1");
                done();
            });
        });
        it("should be able to verify JWT authentication on requests to API via query param", function (done) {
            request.get({
                url: gatewayAddress + "/secure/get?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ"
            }, function (error, response, body) {
                expect(response.statusCode).toEqual(200);
                var result = JSON.parse(body);
                expect(result.args.jwt).toBeDefined();
                done();
            });
        });
        it("should be able to verify Basic authentication on requests to API", function (done) {
            request.get({
                headers: { 'authorization': 'Basic dGVzdDp0ZXN0MTIz' },
                url: gatewayAddress + "/secureBasic/get?arg=1"
            }, function (error, response, body) {
                expect(response.statusCode).toEqual(200);
                var result = JSON.parse(body);
                expect(result.args.arg).toEqual("1");
                done();
            });
        });
    });
});

//# sourceMappingURL=test-auth.spec.js.map
