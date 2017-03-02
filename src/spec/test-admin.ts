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