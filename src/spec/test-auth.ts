import * as express from "express";
import * as request from "request";
import "jasmine";
import {Gateway} from "../lib/gateway";
import {Settings} from "../lib/settings";
import {Container, Scope, Scoped, Provided, Provider, AutoWired, Inject} from "typescript-ioc";

const provider: Provider = { 
  get: () => {
      const settings: Settings = new Settings();
      settings.app = express(); 
	  settings.apiPath = __dirname + '/apis';
	  settings.middlewarePath = __dirname + '/middleware';
      return settings; 
  }
};

Container.bind(Settings).provider(provider)

const gateway: Gateway = Container.get(Gateway);
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
});
