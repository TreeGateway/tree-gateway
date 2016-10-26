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
      return settings; 
  }
};

Container.bind(Settings).scope(Scope.Singleton).provider(provider)

const gateway: Gateway = new Gateway();
const app = gateway.server;
const port = 4567;
const gatewayAddress = "http://localhost:"+port;
let server;
app.set('env', 'test');

describe("Gateway Tests", () => {
	beforeAll(function(done){
		console.log('\nInitializing gateway...');
		gateway.configure(__dirname + '/apis', ()=>{
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
	});
});
