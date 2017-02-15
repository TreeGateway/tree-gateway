import * as express from "express";
import * as request from "request";
import * as fs from "fs-extra-promise";
import * as path from "path";
import {ApiConfig} from "../lib/config/api";
import {CacheConfig} from "../lib/config/cache";
import {Group} from "../lib/config/group";
import {ThrottlingConfig} from "../lib/config/throttling";
import "jasmine";
import {Container} from "typescript-ioc";
import {Configuration} from "../lib/configuration";
import {Gateway} from "../lib/gateway";
import {Database} from "../lib/database";
import {UserService} from "../lib/service/users";

let config = Container.get(Configuration);
let server;
let database = Container.get(Database);
let gateway = Container.get(Gateway);
let userService = Container.get(UserService);
let adminAddress;
let adminRequest;
let adminToken; 
let configToken; 
let simpleToken;

const adminUser = {
    name: "Admin user",
    login: "admin",
    password: "123test",
    email: "test@mail.com",
    roles: ["tree-gateway-admin", "tree-gateway-config"]
};

const configUser = {
    name: "Config user",
    login: "config",
    password: "123test",
    email: "test@mail.com",
    roles: ["tree-gateway-config"]
};

const simpleUser = {
    name: "Simple user",
    login: "simple",
    password: "123test",
    email: "test@mail.com",
    roles: []
};

const getIdFromResponse = (response) => {
	const location = response.headers["location"];
    expect(location).toBeDefined();
    const parts = location ? location.split("/") : [];
    return parts.length > 0 ? parts[parts.length-1] : null;
};

const createUsers = () => {
    return new Promise<void>((resolve, reject)=>{
        userService.create(adminUser)
        .then(() => userService.create(configUser))
        .then(() => userService.create(simpleUser))
        .then(resolve)
        .catch(reject);
    });
};

describe("Admin API", () => {
	beforeAll(function(done){
            gateway.start()
			.then(()=>{
				return gateway.startAdmin();
			})
			.then(() => {
				gateway.server.set('env', 'test');
				adminRequest = request.defaults({baseUrl: `http://localhost:${config.gateway.admin.protocol.http.listenPort}`});

				return database.redisClient.flushdb();
			})
			.then(()=>{
                return createUsers();
            })
			.then(done)
			.catch(fail);
	});

	afterAll(function(done){
		database.redisClient.flushdb()
            .then(() => gateway.stopAdmin())
            .then(() => gateway.stop())
			.then(() => fs.removeAsync(path.join(process.cwd(), 'src', 'spec', 'test-data', 'temp')))
			.then(done)
			.catch(fail);
	});

	describe("/users", () => {
        it("should reject unauthenticated requests", (done) => {
            adminRequest.get("/users/admin", (error, response, body) => {
                expect(response.statusCode).toEqual(401);
                done();
            });
        });
        it("should be able to sign users in", (done) => {
            let form = {
				'login': 'admin',
				'password': '123test'
			};
            adminRequest.post({
                url:"/users/authentication", 
                form: form
            }, (error, response, body) => {
                expect(response.statusCode).toEqual(200);
                adminToken = body;
                done();
            });
        });
        it("should be able to sign users in", (done) => {
            let form = {
				'login': 'config',
				'password': '123test'
			};
            adminRequest.post({
                url:"/users/authentication", 
                form: form
            }, (error, response, body) => {
                expect(response.statusCode).toEqual(200);
                configToken = body;
                done();
            });
        });
        it("should be able to sign users in", (done) => {
            let form = {
				'login': 'simple',
				'password': '123test'
			};
            adminRequest.post({
                url:"/users/authentication", 
                form: form
            }, (error, response, body) => {
                expect(response.statusCode).toEqual(200);
                simpleToken = body;
                done();
            });
        });

    });

	describe("/apis", () => {
        const apiMock = <ApiConfig> {
            name: 'apiMock',
            description: 'API mock',
            version: '1.0'
        };

        it("should be able to create a new API", (done) => {
            adminRequest.post("/apis", {
                headers: { 'authorization': `JWT ${configToken}` },
                body: apiMock, json: true
            }, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(201);
                apiMock.id = getIdFromResponse(response);
                expect(apiMock.id).toBeDefined();
                done();
            });
        });

        it("should reject unauthenticated request to admin apis", (done) => {
            adminRequest.post("/apis", {
                body: apiMock, json: true
            }, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(401);
                done();
            });
        });

        it("should reject an invalid API", (done) => {
            adminRequest.post("/apis", {
                headers: { 'authorization': `JWT ${configToken}` },
                body: {}, json: true
            }, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(403);
                done();
            });
        });

		it("should be able to list all APIs", (done) => {
            adminRequest.get({
                headers: { 'authorization': `JWT ${configToken}` },
                url:"/apis"
            }, (error, response, body)=>{
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(200);
				done();
			});
		});

        it("should be able to update an API", (done) => {
            apiMock.description = 'Updated api';

            adminRequest.put(`/apis/${apiMock.id}`, {
                headers: { 'authorization': `JWT ${configToken}` },
                body: apiMock, json: true
            }, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(204);
                done();
            });
        });

        it("should be able to get an API", (done) => {
            adminRequest.get({
                headers: { 'authorization': `JWT ${configToken}` },
                url:`/apis/${apiMock.id}`
            }, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(200);
                let api = JSON.parse(body);
                expect(api.description).toEqual('Updated api');
                done();
            });
        });

        it("should be able to delete an API", (done) => {
            adminRequest.delete({
                headers: { 'authorization': `JWT ${configToken}` },
                url:`/apis/${apiMock.id}`
            }, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(204);
                done();
            });
        });
    });

	describe("/cache", () => {
        const apiMock = <ApiConfig> {
            name: 'apiMock',
            description: 'API mock',
            version: '1.0'
        };

        const cacheMock = <CacheConfig> {
            client: {
                cacheTime: "1 min"
            },
            server: {
                cacheTime: "1 min"
            }
        };

        beforeAll((done) => {
            adminRequest.post("/apis", {
                headers: { 'authorization': `JWT ${configToken}` },
                body: apiMock, json: true
            }, (error, response, body) => {
                apiMock.id = getIdFromResponse(response);
                done();
            });
        });

        it("should be able to create a new cache config", (done) => {
            adminRequest.post(`/apis/${apiMock.id}/cache`, {
                headers: { 'authorization': `JWT ${configToken}` },
                body: cacheMock, json: true
            }, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(201);
                cacheMock.id = getIdFromResponse(response);
                done();
            });
        });

        it("should reject an invalid cache config", (done) => {
            adminRequest.post(`/apis/${apiMock.id}/cache`, {
                headers: { 'authorization': `JWT ${configToken}` },
                body: {test: 1}, json: true
            }, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(403);
                done();
            });
        });

		it("should be able to list all cache configs", (done) => {
            adminRequest.get({
                headers: { 'authorization': `JWT ${configToken}` },
                url:`/apis/${apiMock.id}/cache`
            }, (error, response, body)=>{
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(200);
                let configs = JSON.parse(body);
                expect(configs.length).toEqual(1);
				done();
			});
		});

        it("should be able to update a cache config", (done) => {
            adminRequest.put(`/apis/${apiMock.id}/cache/${cacheMock.id}`, {
                headers: { 'authorization': `JWT ${configToken}` },
                body: cacheMock, json: true
            }, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(204);
                done();
            });
        });

        it("should be able to get a cache config", (done) => {
            adminRequest.get({
                headers: { 'authorization': `JWT ${configToken}` },
                url:`/apis/${apiMock.id}/cache/${cacheMock.id}`
            }, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(200);
                let cache = JSON.parse(body);
                expect(cache.client.cacheTime).toEqual("1 min");
                expect(cache.server.cacheTime).toEqual("1 min");
                done();
            });
        });

        it("should be able to delete a cache config", (done) => {
            adminRequest.delete({
                headers: { 'authorization': `JWT ${configToken}` },
                url:`/apis/${apiMock.id}/cache/${cacheMock.id}`
            }, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(204);
                done();
            });
        });
    });

	describe("/groups", () => {
        const apiMock = <ApiConfig> {
            name: 'apiGroup',
            description: 'API mock',
            version: '1.0'
        };

        const groupMock = <Group> {
            name: "group1",
            description: "Group 1",
            member: [{
                path: ["/test"],
                method: ["GET"]
            }]
        };

        beforeAll((done) => {
            adminRequest.post("/apis", {
                headers: { 'authorization': `JWT ${configToken}` },
                body: apiMock, json: true
            }, (error, response, body) => {
                apiMock.id = getIdFromResponse(response);
                done();
            });
        });

        it("should be able to create a new group", (done) => {
            adminRequest.post(`/apis/${apiMock.id}/groups`, {
                headers: { 'authorization': `JWT ${configToken}` },
                body: groupMock, json: true
            }, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(201);
                groupMock.id = getIdFromResponse(response);
                done();
            });
        });

        it("should reject an invalid group", (done) => {
            adminRequest.post(`/apis/${apiMock.id}/groups`, {
                headers: { 'authorization': `JWT ${configToken}` },
                body: {}, json: true
            }, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(403);
                done();
            });
        });

		it("should be able to list all groups", (done) => {
            adminRequest.get({
                headers: { 'authorization': `JWT ${configToken}` },
                url:`/apis/${apiMock.id}/groups`
            }, (error, response, body)=>{
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(200);
                let groups = JSON.parse(body);
                expect(groups.length).toEqual(1);
				done();
			});
		});

        it("should be able to update a group", (done) => {
            adminRequest.put(`/apis/${apiMock.id}/groups/${groupMock.id}`, {
                headers: { 'authorization': `JWT ${configToken}` },
                body: groupMock, json: true
            }, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(204);
                done();
            });
        });

        it("should be able to get a group", (done) => {
            adminRequest.get({
                headers: { 'authorization': `JWT ${configToken}` },
                url:`/apis/${apiMock.id}/groups/${groupMock.id}`
            }, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(200);
                expect(JSON.parse(body)).toEqual(groupMock);
                done();
            });
        });

        it("should be able to delete a group", (done) => {
            adminRequest.delete({
                headers: { 'authorization': `JWT ${configToken}` },
                url:`/apis/${apiMock.id}/groups/${groupMock.id}`
            }, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(204);
                done();
            });
        });
    });

	describe("/proxy", () => {
        const apiMock = <ApiConfig> {
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
            adminRequest.post("/apis", {
                headers: { 'authorization': `JWT ${configToken}` },
                body: apiMock, json: true
            }, (error, response, body) => {
                apiMock.id = getIdFromResponse(response);
                done();
            });
        });

        it("should be able to create a new proxy config", (done) => {
            adminRequest.post(`/apis/${apiMock.id}/proxy`, {
                headers: { 'authorization': `JWT ${configToken}` },
                body: proxyMock, json: true
            }, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(201);
                done();
            });
        });

        it("should reject an invalid proxy config", (done) => {
            adminRequest.post(`/apis/${apiMock.id}/proxy`, {
                headers: { 'authorization': `JWT ${configToken}` },
                body: {}, json: true
            }, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(403);
                done();
            });
        });

        it("should be able to update a proxy config", (done) => {
            adminRequest.put(`/apis/${apiMock.id}/proxy`, {
                headers: { 'authorization': `JWT ${configToken}` },
                body: proxyMock, json: true
            }, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(204);
                done();
            });
        });

        it("should be able to get a proxy config", (done) => {
            adminRequest.get({
                headers: { 'authorization': `JWT ${configToken}` },
                url:`/apis/${apiMock.id}/proxy`
            }, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(200);
                expect(JSON.parse(body)).toEqual(proxyMock);
                done();
            });
        });

        it("should be able to delete a proxy config", (done) => {
            adminRequest.delete({
                headers: { 'authorization': `JWT ${configToken}` },
                url:`/apis/${apiMock.id}/proxy`
            }, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(204);
                done();
            });
        });
    });


	describe("/throttling", () => {
        const apiMock = <ApiConfig> {
            name: 'apiThrottling',
            description: 'API mock',
            version: '1.0'
        };

        const throttlingMock = <ThrottlingConfig> {
            windowMs: 1000,
            delayAfter: 0,
            max: 10
        };

        beforeAll((done) => {
            adminRequest.post("/apis", {
                headers: { 'authorization': `JWT ${configToken}` },
                body: apiMock, json: true
            }, (error, response, body) => {
                apiMock.id = getIdFromResponse(response);
                done();
            });
        });

        it("should be able to create a throttling config", (done) => {
            adminRequest.post(`/apis/${apiMock.id}/throttling`, {
                headers: { 'authorization': `JWT ${configToken}` },
                body: throttlingMock, json: true
            }, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(201);
                throttlingMock.id = getIdFromResponse(response);
                done();
            });
        });

        it("should reject an invalid throttling config", (done) => {
            adminRequest.post(`/apis/${apiMock.id}/throttling`, {
                headers: { 'authorization': `JWT ${configToken}` },
                body: {test: 1}, json: true
            }, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(403);
                done();
            });
        });

		it("should be able to list all throttling configs", (done) => {
            adminRequest.get({
                headers: { 'authorization': `JWT ${configToken}` },
                url:`/apis/${apiMock.id}/throttling`
            }, (error, response, body)=>{
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(200);
                expect(JSON.parse(body).length).toEqual(1);
				done();
			});
		});

        it("should be able to update a throttling config", (done) => {
            adminRequest.put(`/apis/${apiMock.id}/throttling/${throttlingMock.id}`, {
                headers: { 'authorization': `JWT ${configToken}` },
                body: throttlingMock, json: true
            }, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(204);
                done();
            });
        });

        it("should be able to get a throttling config", (done) => {
            adminRequest.get({
                headers: { 'authorization': `JWT ${configToken}` },
                url:`/apis/${apiMock.id}/throttling/${throttlingMock.id}`
            }, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(200);
                expect(JSON.parse(body).windowMs).toEqual(throttlingMock.windowMs);
                done();
            });
        });

        it("should be able to delete a throttling config", (done) => {
            adminRequest.delete({
                headers: { 'authorization': `JWT ${configToken}` },
                url:`/apis/${apiMock.id}/throttling/${throttlingMock.id}`
            }, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(204);
                done();
            });
        });
    });

	describe("/users", () => {
        it("should reject requests with low privileges", (done) => {
            adminRequest.delete({
                headers: { 'authorization': `JWT ${configToken}` },
                url:`/users/simple`
            }, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(403);
                done();
            });
        });
        it("should be able to remove users", (done) => {
            adminRequest.delete({
                headers: { 'authorization': `JWT ${adminToken}` },
                url:`/users/simple`
            }, (error, response, body) => {
                expect(error).toBeNull();
                expect(response.statusCode).toEqual(204);
                done();
            });
        });
    });    
});