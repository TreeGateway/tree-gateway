import * as express from "express";
import * as request from "request";
import "jasmine";
import {Gateway} from "../lib/gateway";

const gateway: Gateway = new Gateway(express(), {
	rootPath: __dirname,
	apiPath: __dirname + '/../../../apis',
	middlewarePath: __dirname + '/../../../middleware', 
	logger: {
		console: {
			colorize: true
		}
	}
});
const app = gateway.server;
const port = 4568;
const gatewayAddress = "http://localhost:"+port;
let server;
app.set('env', 'test');

describe("Gateway Tests", () => {
	beforeAll(function(done){
		console.log('\nInitializing gateway...');
		gateway.initialize(()=>{
			console.log('Gateway configured');
			server = app.listen(port, ()=>{
				console.log('Gateway started');
				done();
			});
		});
	});

	afterAll(function(){
		server.close();
	});

	describe("The Gateway Proxy", () => {
		it("should be able to proxy an API", (done) => {
			request(gatewayAddress+"/test/get?arg=1", (error, response, body)=>{
				let result = JSON.parse(body);
				expect(result.args.arg).toEqual("1");
				done();				
			});
		});
		it("should be able to filter requests by method", (done) => {
			request(gatewayAddress+"/test/post", (error, response, body)=>{
				expect(response.statusCode).toEqual(405);
				done();				
			});
		});
		it("should be able to filter requests by path", (done) => {
			request(gatewayAddress+"/test/user-agent", (error, response, body)=>{
				expect(response.statusCode).toEqual(404);
				done();				
			});
		});
		it("should be able to filter requests with custom filters", (done) => {
			request(gatewayAddress+"/filtered/get", (error, response, body)=>{
				expect(response.statusCode).toEqual(200);
				request(gatewayAddress+"/filtered/user-agent", (error, response, body)=>{
					expect(response.statusCode).toEqual(404);
					request(gatewayAddress+"/filtered/get?denyParam=1", (error, response, body)=>{
						expect(response.statusCode).toEqual(404);
						done();				
					});
				});
			});
		});
		it("should be able to intercept requests ", (done) => {
			request(gatewayAddress+"/intercepted/get", (error, response, body)=>{
				expect(response.statusCode).toEqual(200);
				let result = JSON.parse(body);
				expect(result.headers['X-Proxied-By']).toEqual("Tree-Gateway");
				expect(result.headers['X-Proxied-2-By']).toEqual("Tree-Gateway");
				done();				
			});
		});
		it("should be able to intercept requests with applies filter", (done) => {
			request(gatewayAddress+"/intercepted/headers", (error, response, body)=>{
				expect(response.statusCode).toEqual(200);
				let result = JSON.parse(body);
				expect(result.headers['X-Proxied-2-By']).toEqual("Tree-Gateway");
				done();				
			});
		});
		it("should be able to intercept responses ", (done) => {
			request(gatewayAddress+"/intercepted/get", (error, response, body)=>{
				expect(response.statusCode).toEqual(200);
				let result = JSON.parse(body);
				expect(response.headers['via']).toEqual("previous Interceptor wrote: Changed By Tree-Gateway");
				done();				
			});
		});
		it("should be able to intercept responses with applies filter", (done) => {
			request(gatewayAddress+"/intercepted/headers", (error, response, body)=>{
				expect(response.statusCode).toEqual(200);
				let result = JSON.parse(body);
				expect(response.headers['via']).toEqual("Changed By Tree-Gateway");
				done();				
			});
		});
	});

	describe("The Gateway Limit Controller", () => {
		it("should be able to limit the requests to API", (done) => {
			request(gatewayAddress+"/limited/get?arg=1", (error, response, body)=>{
				let result = JSON.parse(body);
				expect(result.args.arg).toEqual("1");
				request(gatewayAddress+"/limited/get?arg=1", (error, response, body)=>{
					expect(response.statusCode).toEqual(429);
					expect(body).toEqual("Too many requests, please try again later.");
					done();				
				});
			});
		});
	});

	describe("The Gateway Authenticator", () => {
		it("should be able deny request without authentication", (done) => {
			request(gatewayAddress+"/secure/get?arg=1", (error, response, body)=>{
				expect(response.statusCode).toEqual(401);
				done();				
			});
		});

		it("should be able to verify JWT authentication on requests to API", (done) => {
			request.get({
				headers: { 'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ' },
				url:gatewayAddress+"/secure/get?arg=1"
			}, (error, response, body)=>{
				expect(response.statusCode).toEqual(200);
				let result = JSON.parse(body);
				expect(result.args.arg).toEqual("1");
				done();				
			});
		});

		it("should be able to verify JWT authentication on requests to API via query param", (done) => {
			request.get({
				url:gatewayAddress+"/secure/get?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ"
			}, (error, response, body)=>{
				expect(response.statusCode).toEqual(200);
				let result = JSON.parse(body);
				expect(result.args.jwt).toBeDefined();
				done();				
			});
		});

		it("should be able to verify Basic authentication on requests to API", (done) => {
			request.get({
				headers: { 'authorization': 'Basic dGVzdDp0ZXN0MTIz' },
				url:gatewayAddress+"/secureBasic/get?arg=1"
			}, (error, response, body)=>{
				expect(response.statusCode).toEqual(200);
				let result = JSON.parse(body);
				expect(result.args.arg).toEqual("1");
				done();				
			});
		});
		
		it("should be able to verify Local authentication on requests to API", (done) => {
			request.get({
				url:gatewayAddress+"/secureLocal/get?userid=test&passwd=test123"
			}, (error, response, body)=>{
				expect(response.statusCode).toEqual(200);
				let result = JSON.parse(body);
				expect(result.args.userid).toEqual("test");
				done();				
			});
		});
	});
	
});
