import * as express from "express";
import * as request from "request";
import * as fs from "fs-extra-promise";
import * as path from "path";
import "jasmine";
import {Gateway} from "../lib/gateway";
import * as dbConfig from "../lib/redis";

let server;
let gateway: Gateway;
let adminAddress: string;
let adminRequest;
describe("Admin API", () => {
	beforeAll(function(done){
		gateway = new Gateway("./tree-gateway.json");

		gateway.start()
			.then(()=>{
				return gateway.startAdmin();
			})
			.then(() => {
				gateway.server.set('env', 'test');
				adminRequest = request.defaults({baseUrl: `http://localhost:${gateway.config.protocol.http.adminPort}`});

				return gateway.redisClient.flushdb();
			})
			.then(done)
			.catch(fail);
	});

	afterAll(function(done){
		gateway.redisClient.flushdb()
			.then(() => {
				gateway.stopAdmin();
				gateway.stop();
				return fs.removeAsync(path.join(process.cwd(), 'src', 'spec', 'test-data', 'temp'));
			})
			.then(done)
			.catch(fail);
	});

	describe("/apis", () => {
        const apiMock = {
            name: 'apiMock',
            description: 'API mock',
            version: '1.0'
        };

        it("should be able to create a new API", (done) => {
            adminRequest.post("/apis", {body: apiMock, json: true}, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(201);
                done();
            });
        });

        it("should reject an invalid API", (done) => {
            adminRequest.post("/apis", {body: {}, json: true}, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(403);
                done();
            });
        });

		it("should be able to list all APIs", (done) => {
			adminRequest("/apis", (error, response, body)=>{
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(200);
				done();
			});
		});

        it("should be able to update an API", (done) => {
            apiMock.description = 'Updated api';

            adminRequest.put(`/apis/${apiMock.name}/${apiMock.version}`, {body: apiMock, json: true}, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(204);
                done();
            });
        });

        it("should be able to get an API", (done) => {
            adminRequest(`/apis/${apiMock.name}/${apiMock.version}`, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(200);
                let api = JSON.parse(body);
                expect(api.description).toEqual('Updated api');
                done();
            });
        });

        it("should be able to delete an API", (done) => {
            adminRequest.delete(`/apis/${apiMock.name}/${apiMock.version}`, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(204);
                done();
            });
        });
    });

	describe("/cache", () => {
        const apiMock = {
            name: 'apiMock',
            description: 'API mock',
            version: '1.0'
        };

        const cacheMock = {
            client: {
                cacheTime: "1 min"
            },
            server: {
                cacheTime: "1 min"
            },
            group: ["Group1", "Group2"]
        };

        beforeAll((done) => {
            adminRequest.post("/apis", {body: apiMock, json: true}, (error, response, body) => {
                done();
            });
        });

        it("should be able to create a new cache config", (done) => {
            adminRequest.post(`/apis/${apiMock.name}/${apiMock.version}/cache`, {body: cacheMock, json: true}, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(201);
                done();
            });
        });

        it("should reject an invalid cache config", (done) => {
            adminRequest.post(`/apis/${apiMock.name}/${apiMock.version}/cache`, {body: {test: 1}, json: true}, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(403);
                done();
            });
        });

		it("should be able to list all cache configs", (done) => {
			adminRequest(`/apis/${apiMock.name}/${apiMock.version}/cache`, (error, response, body)=>{
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(200);
                let configs = JSON.parse(body);
                expect(configs.length).toEqual(1);
				done();
			});
		});

        it("should be able to update a cache config", (done) => {
            adminRequest.put(`/apis/${apiMock.name}/${apiMock.version}/cache/1`, {body: cacheMock, json: true}, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(204);
                done();
            });
        });

        it("should be able to get a cache config", (done) => {
            adminRequest(`/apis/${apiMock.name}/${apiMock.version}/cache/1`, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(200);
                let cache = JSON.parse(body);
                expect(cache.client.cacheTime).toEqual("1 min");
                expect(cache.server.cacheTime).toEqual("1 min");
                done();
            });
        });

        it("should be able to delete a cache config", (done) => {
            adminRequest.delete(`/apis/${apiMock.name}/${apiMock.version}/cache/1`, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(204);
                done();
            });
        });
    });

	describe("/groups", () => {
        const apiMock = {
            name: 'apiGroup',
            description: 'API mock',
            version: '1.0'
        };

        const groupMock = {
            name: "group1",
            description: "Group 1",
            member: [{
                path: ["/test"],
                method: ["GET"]
            }]
        };

        beforeAll((done) => {
            adminRequest.post("/apis", {body: apiMock, json: true}, (error, response, body) => {
                done();
            });
        });

        it("should be able to create a new group", (done) => {
            adminRequest.post(`/apis/${apiMock.name}/${apiMock.version}/groups`, {body: groupMock, json: true}, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(201);
                done();
            });
        });

        it("should reject an invalid group", (done) => {
            adminRequest.post(`/apis/${apiMock.name}/${apiMock.version}/groups`, {body: {}, json: true}, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(403);
                done();
            });
        });

		it("should be able to list all groups", (done) => {
			adminRequest(`/apis/${apiMock.name}/${apiMock.version}/groups`, (error, response, body)=>{
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(200);
                let groups = JSON.parse(body);
                expect(groups.length).toEqual(1);
				done();
			});
		});

        it("should be able to update a group", (done) => {
            adminRequest.put(`/apis/${apiMock.name}/${apiMock.version}/groups/group1`, {body: groupMock, json: true}, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(204);
                done();
            });
        });

        it("should be able to get a group", (done) => {
            adminRequest(`/apis/${apiMock.name}/${apiMock.version}/groups/group1`, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(200);
                expect(JSON.parse(body)).toEqual(groupMock);
                done();
            });
        });

        it("should be able to delete a group", (done) => {
            adminRequest.delete(`/apis/${apiMock.name}/${apiMock.version}/groups/group1`, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(204);
                done();
            });
        });
    });

	describe("/proxy", () => {
        const apiMock = {
            name: 'apiProxy',
            description: 'API mock',
            version: '1.0'
        };

        const proxyMock = {
            path: "/test",
            target: {
                path: "/testTarget"
            }
        };

        beforeAll((done) => {
            adminRequest.post("/apis", {body: apiMock, json: true}, (error, response, body) => {
                done();
            });
        });

        it("should be able to create a new proxy config", (done) => {
            adminRequest.post(`/apis/${apiMock.name}/${apiMock.version}/proxy`, {body: proxyMock, json: true}, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(201);
                done();
            });
        });

        it("should reject an invalid proxy config", (done) => {
            adminRequest.post(`/apis/${apiMock.name}/${apiMock.version}/proxy`, {body: {}, json: true}, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(403);
                done();
            });
        });

        it("should be able to update a proxy config", (done) => {
            adminRequest.put(`/apis/${apiMock.name}/${apiMock.version}/proxy`, {body: proxyMock, json: true}, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(204);
                done();
            });
        });

        it("should be able to get a proxy config", (done) => {
            adminRequest(`/apis/${apiMock.name}/${apiMock.version}/proxy`, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(200);
                expect(JSON.parse(body)).toEqual(proxyMock);
                done();
            });
        });

        it("should be able to delete a proxy config", (done) => {
            adminRequest.delete(`/apis/${apiMock.name}/${apiMock.version}/proxy`, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(204);
                done();
            });
        });
    });


	describe("/throttling", () => {
        const apiMock = {
            name: 'apiThrottling',
            description: 'API mock',
            version: '1.0'
        };

        const throttlingMock = {
            windowMs: 1000,
            delayAfter: 0,
            max: 10
        };

        beforeAll((done) => {
            adminRequest.post("/apis", {body: apiMock, json: true}, (error, response, body) => {
                done();
            });
        });

        it("should be able to create a throttling config", (done) => {
            adminRequest.post(`/apis/${apiMock.name}/${apiMock.version}/throttling`, {body: throttlingMock, json: true}, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(201);
                done();
            });
        });

        it("should reject an invalid throttling config", (done) => {
            adminRequest.post(`/apis/${apiMock.name}/${apiMock.version}/throttling`, {body: {test: 1}, json: true}, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(403);
                done();
            });
        });

		it("should be able to list all throttling configs", (done) => {
			adminRequest(`/apis/${apiMock.name}/${apiMock.version}/throttling`, (error, response, body)=>{
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(200);
                expect(JSON.parse(body).length).toEqual(1);
				done();
			});
		});

        it("should be able to update a throttling config", (done) => {
            adminRequest.put(`/apis/${apiMock.name}/${apiMock.version}/throttling/1`, {body: throttlingMock, json: true}, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(204);
                done();
            });
        });

        it("should be able to get a throttling config", (done) => {
            adminRequest(`/apis/${apiMock.name}/${apiMock.version}/throttling/1`, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(200);
                expect(JSON.parse(body).windowMs).toEqual(throttlingMock.windowMs);
                done();
            });
        });

        it("should be able to delete a throttling config", (done) => {
            adminRequest.delete(`/apis/${apiMock.name}/${apiMock.version}/throttling/1`, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(204);
                done();
            });
        });
    });
});