import * as express from "express";
import * as request from "request";
import * as fs from "fs-extra-promise";
import * as path from "path";
import * as _ from "lodash";
import "jasmine";
import {Gateway} from "../lib/gateway";
import {ApiConfig} from "../lib/config/api";
import {UserService, loadUserService} from "../lib/service/users";

let server;
let gateway: Gateway;
let gatewayRequest;
let adminRequest;
let userService: UserService;
let configToken; 

const configUser = {
    name: "Config user",
    login: "config",
    password: "123test",
    email: "test@mail.com",
    roles: ["tree-gateway-config"]
};

const createUser = () => {
    return new Promise<void>((resolve, reject)=>{
        userService = loadUserService(gateway.redisClient, gateway.config.admin.users);
        userService.create(configUser)
        .then(resolve)
        .catch(reject);
    });
};


const authenticate = () => {
	return new Promise<void>((resolve, reject)=>{
		let form = {
			'login': 'config',
			'password': '123test'
		};
		adminRequest.post("/users/authentication",{				
			form: form
		}, (error, response, body) => {
			if (error) {
				return reject(error);
			}
			configToken = body;
			resolve();
		});
	});
};	

const getIdFromResponse = (response) => {
    const parts = response.headers["location"].split("/");
    return parts[parts.length-1];
};

describe("Gateway Tests", () => {
	beforeAll(function(done){
		gateway = new Gateway("./tree-gateway.json");

		gateway.start()
			.then(()=>{
				return gateway.startAdmin();
			})
			.then(() => {
				gateway.server.set('env', 'test');
				gatewayRequest = request.defaults({baseUrl: `http://localhost:${gateway.config.protocol.http.listenPort}`});
				adminRequest = request.defaults({baseUrl: `http://localhost:${gateway.config.admin.protocol.http.listenPort}`});

				return gateway.redisClient.flushdb();
			})
			.then(()=>{
                return createUser();
            })
			.then(()=>{
				return authenticate();
			})
			.then(()=>{
				return installMiddlewares();
			})
			.then(()=>{
				return installApis();
			})
			.then(done)
			.catch(err => {
				console.error(err);
				fail();
			});
	});

	afterAll(function(done){
		gateway.redisClient.flushdb()
            .then(() => gateway.stopAdmin())
            .then(() => gateway.stop())
			.then(() => fs.removeAsync(path.join(process.cwd(), 'src', 'spec', 'test-data', 'root', 'middleware')))
			.then(() => fs.removeAsync(path.join(process.cwd(), 'src', 'spec', 'test-data', 'root', 'logs')))
			.then(done)
			.catch(fail);
	});

	describe("The Gateway Proxy", () => {
		it("should be able to proxy an API", (done) => {
			gatewayRequest("/test/get?arg=1", (error, response, body)=>{
				expect(response.statusCode).toEqual(200);
				expect(body).toBeDefined();
				let result = JSON.parse(body);
				expect(result.args.arg).toEqual("1");
				done();				
			});
		});
		it("should be able to filter requests by method", (done) => {
			gatewayRequest("/test/post", (error, response, body)=>{
				expect(response.statusCode).toEqual(405);
				done();				
			});
		});
		it("should be able to filter requests by path", (done) => {
			gatewayRequest("/test/user-agent", (error, response, body)=>{
				expect(response.statusCode).toEqual(404);
				done();				
			});
		});
		it("should be able to filter requests with custom filters", (done) => {
			gatewayRequest("/filtered/get", (error, response, body)=>{
				expect(response.statusCode).toEqual(200);
				gatewayRequest("/filtered/user-agent", (error, response, body)=>{
					expect(response.statusCode).toEqual(404);
					gatewayRequest("/filtered/get?denyParam=1", (error, response, body)=>{
						expect(response.statusCode).toEqual(404);
						done();				
					});
				});
			});
		});
		it("should be able to intercept requests ", (done) => {
			gatewayRequest("/intercepted/get", (error, response, body)=>{
				expect(response.statusCode).toEqual(200);
				let result = JSON.parse(body);
				expect(result.headers['X-Proxied-By']).toEqual("Tree-Gateway");
				expect(result.headers['X-Proxied-2-By']).toEqual("Tree-Gateway");
				done();				
			});
		});
		it("should be able to intercept requests with applies filter", (done) => {
			gatewayRequest("/intercepted/headers", (error, response, body)=>{
				expect(response.statusCode).toEqual(200);
				let result = JSON.parse(body);
				expect(result.headers['X-Proxied-2-By']).toEqual("Tree-Gateway");
				done();				
			});
		});
		it("should be able to intercept responses ", (done) => {
			gatewayRequest("/intercepted/get", (error, response, body)=>{
				expect(response.statusCode).toEqual(200);
				let result = JSON.parse(body);
				expect(response.headers['via']).toEqual("previous Interceptor wrote: Changed By Tree-Gateway, 1.1 Tree-Gateway");
				done();				
			});
		});
		it("should be able to intercept responses with applies filter", (done) => {
			gatewayRequest("/intercepted/headers", (error, response, body)=>{
				expect(response.statusCode).toEqual(200);
				let result = JSON.parse(body);
				expect(response.headers['via']).toEqual("Changed By Tree-Gateway, 1.1 Tree-Gateway");
				done();				
			});
		});
	});

	describe("The Gateway Limit Controller", () => {
		it("should be able to limit the requests to API", (done) => {
			gatewayRequest("/limited/get?arg=1", (error, response, body)=>{
				expect(response.statusCode).toEqual(200);
				let result = JSON.parse(body);
				expect(result.args.arg).toEqual("1");
				gatewayRequest("/limited/get?arg=1", (error, response, body)=>{
					expect(response.statusCode).toEqual(429);
					expect(body).toEqual("Too many requests, please try again later.");
					done();				
				});
			});
		});
		it("should be able to restict the limit to an API Group", (done) => {
			gatewayRequest("/limited-by-group/get?arg=1", (error, response, body)=>{
				let result = JSON.parse(body);
				expect(result.args.arg).toEqual("1");
				gatewayRequest("/limited-by-group/get?arg=1", (error, response, body)=>{
					expect(response.statusCode).toEqual(429);
					expect(body).toEqual("Too many requests, please try again later.");
					done();				
				});
			});
		});
		it("should be able to restict the limit to an API Group", (done) => {
			gatewayRequest("/limited-by-group/headers", (error, response, body)=>{
				expect(response.statusCode).toEqual(200);
				gatewayRequest("/limited-by-group/headers", (error, response, body)=>{
					expect(response.statusCode).toEqual(200);
					done();				
				});
			});
		});
	});

	describe("The Gateway Authenticator", () => {
		it("should be able deny request without authentication", (done) => {
			gatewayRequest("/secure/get?arg=1", (error, response, body)=>{
				expect(response.statusCode).toEqual(401);
				done();				
			});
		});

		it("should be able to verify JWT authentication on requests to API", (done) => {
			gatewayRequest.get({
				headers: { 'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ' },
				url:"/secure/get?arg=1"
			}, (error, response, body)=>{
				expect(response.statusCode).toEqual(200);
				let result = JSON.parse(body);
				expect(result.args.arg).toEqual("1");
				done();				
			});
		});

		it("should be able to verify JWT authentication on requests to API via query param", (done) => {
			gatewayRequest.get({
				url:"/secure/get?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ"
			}, (error, response, body)=>{
				expect(response.statusCode).toEqual(200);
				let result = JSON.parse(body);
				expect(result.args.jwt).toBeDefined();
				done();				
			});
		});

		it("should be able to verify Basic authentication on requests to API", (done) => {
			gatewayRequest.get({
				headers: { 'authorization': 'Basic dGVzdDp0ZXN0MTIz' },
				url:"/secureBasic/get?arg=1"
			}, (error, response, body)=>{
				expect(response.statusCode).toEqual(200);
				let result = JSON.parse(body);
				expect(result.args.arg).toEqual("1");
				done();				
			});
		});
		
		it("should be able to verify authentication only to restricted groups in API", (done) => {
			gatewayRequest.get({
				url:"/secureBasic-by-group/get?arg=1"
			}, (error, response, body)=>{
				expect(response.statusCode).toEqual(401);
				done();				
			});
		});

		it("should be able to verify authentication only to restricted groups in API", (done) => {
			gatewayRequest.get({
				url:"/secureBasic-by-group/headers"
			}, (error, response, body)=>{
				expect(response.statusCode).toEqual(200);
				done();				
			});
		});

		it("should be able to verify Local authentication on requests to API", (done) => {
			gatewayRequest.get({
				url:"/secureLocal/get?userid=test&passwd=test123"
			}, (error, response, body)=>{
				expect(response.statusCode).toEqual(200);
				let result = JSON.parse(body);
				expect(result.args.userid).toEqual("test");
				done();				
			});
		});

		it("should be able to verify a custom authentication on requests to API", (done) => {
			gatewayRequest.get({
				url:"/secureCustom/get?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ"
			}, (error, response, body)=>{
				expect(response.statusCode).toEqual(200);
				let result = JSON.parse(body);
				expect(result.args.jwt).toBeDefined();
				done();				
			});
		});
	});
	
	describe("The Gateway Cache", () => {
		it("should be able to cache request on client", (done) => {
			gatewayRequest("/testCache/get", (error, response, body)=>{
				expect(response.statusCode).toEqual(200);
				expect(response.headers['cache-control']).toEqual("public,max-age=60");
				done();				
			});
		});

		it("should be able to preserve headers on requests from server cache", (done) => {
			gatewayRequest("/testCache/get", (error, response, body)=>{
				expect(response.statusCode).toEqual(200);
				expect(response.headers['access-control-allow-credentials']).toEqual("true");
				done();				
			});
		});
	});

	function installApis():Promise<void>{
         return new Promise<void>((resolve, reject)=>{
		    let pathApi = './src/spec/test-data/apis/';

            fs.readdirAsync(pathApi)
				.then((files) => {
                	let promises = files.map(file => {return fs.readJsonAsync(pathApi+file)})
                	return Promise.all(promises);
            	})
				.then((apis) => {
					let promises = apis.map(apiConfig => installApi(apiConfig));

					return Promise.all(promises);
            	})
				.then(() => {
					setTimeout(resolve, 1000);
				})
				.catch(reject);
		});
	}

	function installApi(apiConfig: ApiConfig): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			let api = _.omit(apiConfig, 'proxy', 'group', 'throttling', 'authentication', 'cache', 'serviceDiscovery');

			adminRequest.post("/apis", {
                headers: { 'authorization': `JWT ${configToken}` },
				body: api, json: true
			}, (error, response, body) => {
				expect(error).toBeNull();
				expect(response.statusCode).toEqual(201);
				apiConfig.id = getIdFromResponse(response);

				installApiGroups(apiConfig.id, apiConfig.group)
					.then(() => installApiProxy(apiConfig.id, apiConfig.proxy))
					.then(() => installApiCache(apiConfig.id, apiConfig.cache))
					.then(() => installApiThrottling(apiConfig.id, apiConfig.throttling))
					.then(() => installApiAuthentication(apiConfig.id, apiConfig.authentication))
					.then(() => installApiCircuitBreaker(apiConfig.id, apiConfig.circuitBreaker))
					.then(resolve)
					.catch(reject);
			});
		});
	}

	function installApiGroups(apiId: string, groups): Promise<any> {
		if (groups && groups.length > 0) {
			const promises = groups.map((group) => installApiGroup(apiId, group));

			return Promise.all(promises);
		} else {
			return Promise.resolve();
		}
	}

	function installApiAuthentication(apiId: string, authentication): Promise<void> {
		return new Promise<void>((resolve, reject)=>{
			if (!authentication) {
				return resolve();
			}
			adminRequest.post(`/apis/${apiId}/authentication`, {
                headers: { 'authorization': `JWT ${configToken}` },
				body: authentication, json: true
			}, (error, response, body) => {
				if(error) {
					reject(error);
				}
				expect(response.statusCode).toEqual(201);
				resolve();
			});
		});
	}

	function installApiCircuitBreaker(apiId: string, circuitbreaker): Promise<void> {
		return new Promise<void>((resolve, reject)=>{
			if (!circuitbreaker) {
				return resolve();
			}
			adminRequest.post(`/apis/${apiId}/circuitbreaker`, {
                headers: { 'authorization': `JWT ${configToken}` },
				body: circuitbreaker, json: true
			}, (error, response, body) => {
				if(error) {
					reject(error);
				}
				expect(response.statusCode).toEqual(201);
				resolve();
			});
		});
	}

	function installApiCache(apiId: string, apiCache): Promise<void> {
		return new Promise<void>((resolve, reject)=>{
			if (!apiCache) {
				return resolve();
			}
			let returned=0, expected = apiCache.length;

			apiCache.forEach(cache=>{
				adminRequest.post(`/apis/${apiId}/cache`, {
	                headers: { 'authorization': `JWT ${configToken}` },
					body: cache, json: true
				}, (error, response, body) => {
					if(error) {
						reject(error);
					}
					expect(response.statusCode).toEqual(201);
					returned++;
					if (returned === expected) {
						resolve();
					}
				});
			});
		});
	}

	function installApiThrottling(apiId: string, throttling): Promise<void> {
		return new Promise<void>((resolve, reject)=>{
			if (!throttling) {
				return resolve();
			}
			let returned=0, expected = throttling.length;
			throttling.forEach(throt=>{
				adminRequest.post(`/apis/${apiId}/throttling`, {
	                headers: { 'authorization': `JWT ${configToken}` },
					body: throt, json: true
				}, (error, response, body) => {
					if(error) {
						reject(error);
					}
					expect(response.statusCode).toEqual(201);
					returned++;
					if (returned === expected) {
						resolve();
					}
				});
			});	
		});
	}

	function installApiProxy(apiId: string, apiProxy): Promise<void> {
		return new Promise<void>((resolve, reject)=>{
			if (!apiProxy) {
				return resolve();
			}
			adminRequest.post(`/apis/${apiId}/proxy`, {
                headers: { 'authorization': `JWT ${configToken}` },
				body: apiProxy, json: true
			}, (error, response, body) => {
				if(error) {
					reject(error);
				}
				expect(response.statusCode).toEqual(201);
				resolve();
			});
		});
	}

	function installApiGroup(apiId: string, group): Promise<void> {
		return new Promise<void>((resolve, reject)=>{
			if (!group) {
				return resolve();
			}
			adminRequest.post(`/apis/${apiId}/groups`, {
                headers: { 'authorization': `JWT ${configToken}` },
				body: group, json: true
			}, (error, response, body) => {
				if(error) {
					reject(error);
				}
				expect(response.statusCode).toEqual(201);
				resolve();
			});
		});
	}

	function installMiddleware(fileName: string, servicePath: string, dir: string): Promise<void> {
		return new Promise<void>((resolve, reject)=>{
		    let pathMiddleware = './src/spec/test-data/middleware/';
			let filePath = path.join(pathMiddleware, dir, fileName+'.js');

			let req = adminRequest.post('/middleware'+servicePath, {
                headers: { 'authorization': `JWT ${configToken}` }				
			}, (error, response, body) => {
				if (error) {
					return reject(error);
				}
				if (response.statusCode == 201){
					return resolve();
				}
				return reject(`Status code: ${response.statusCode}`);
			});
			let form: FormData = req.form();
			form.append('name', fileName);
			form.append('file', fs.createReadStream(filePath), fileName+'.js');
		});
	}

	function uninstallMiddleware(fileName: string, servicePath: string): Promise<void> {
		return new Promise<void>((resolve, reject)=>{
			let req = adminRequest.delete({
                headers: { 'authorization': `JWT ${configToken}` },
				url: '/middleware'+servicePath+fileName
			}, (error, response, body) => {
				if (error) {
					return reject(error);
				}
				if (response.statusCode == 204){
					return resolve();
				}
				return reject(`Status code: ${response.statusCode}`);
			});
		});
	}

	function installMiddlewares():Promise<void>{
         return new Promise<void>((resolve, reject)=>{
			 installMiddleware('myJwtStrategy', '/authentication/strategies/', '/authentication/strategies')
			 .then(()=>{
				 return installMiddleware('verifyBasicUser', '/authentication/verify/', '/authentication/verify')
			 })
			 .then(()=>{
				 return installMiddleware('verifyJwtUser', '/authentication/verify/', '/authentication/verify')
			 })
			 .then(()=>{
				 return installMiddleware('myCustomFilter', '/filters', '/filter')
			 })
			 .then(()=>{
				 return installMiddleware('mySecondFilter', '/filters', '/filter')
			 })
			 .then(()=>{
				 return installMiddleware('myRequestInterceptor', '/interceptors/request', '/interceptor/request')
			 })
			 .then(()=>{
				 return installMiddleware('mySecondRequestInterceptor', '/interceptors/request', '/interceptor/request')
			 })
			 .then(()=>{
				 return installMiddleware('myResponseInterceptor', '/interceptors/response', '/interceptor/response')
			 })
			 .then(()=>{
				 return installMiddleware('SecondInterceptor', '/interceptors/response', '/interceptor/response')
			 })
			 .then(()=>{
				 return installMiddleware('myOpenHandler', '/circuitbreaker', '/circuitbreaker')
			 })
			 .then(() => {
				 setTimeout(resolve, 1500);
			 })
			 .catch(reject);
		});
	}
});
