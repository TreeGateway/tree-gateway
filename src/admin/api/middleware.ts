'use strict';

import * as path from 'path';
import { Inject } from 'typescript-ioc';
import { DELETE, Errors, FileParam, FormParam, GET, Path, PathParam, POST, PUT, QueryParam, Return } from 'typescript-rest';
import * as swagger from 'typescript-rest-swagger';
import { MiddlewareService } from '../../service/middleware';

@Path('middleware')
@swagger.Tags('Middleware')
@swagger.Security('Bearer')
export class MiddlewareRest {
    @Inject private service: MiddlewareService;

    @GET
    @Path('filters')
    public filters(@QueryParam('name') name?: string): Promise<Array<string>> {
        return this.service.list('filter', name);
    }

    @GET
    @Path('interceptors/request')
    public requestInterceptors(@QueryParam('name') name?: string): Promise<Array<string>> {
        return this.service.list('interceptor/request', name);
    }

    @GET
    @Path('interceptors/response')
    public responseInterceptors(@QueryParam('name') name?: string): Promise<Array<string>> {
        return this.service.list('interceptor/response', name);
    }

    @GET
    @Path('authentication/strategies')
    public authStrategies(@QueryParam('name') name?: string): Promise<Array<string>> {
        return this.service.list('authentication/strategy', name);
    }

    @GET
    @Path('authentication/verify')
    public authVerify(@QueryParam('name') name?: string): Promise<Array<string>> {
        return this.service.list('authentication/verify', name);
    }

    @GET
    @Path('throttling/keyGenerators')
    public throttlingKeyGenerator(@QueryParam('name') name?: string): Promise<Array<string>> {
        return this.service.list('throttling/keyGenerator', name);
    }

    @GET
    @Path('throttling/handlers')
    public throttlingHandler(@QueryParam('name') name?: string): Promise<Array<string>> {
        return this.service.list('throttling/handler', name);
    }

    @GET
    @Path('throttling/skip')
    public throttlingSkip(@QueryParam('name') name?: string): Promise<Array<string>> {
        return this.service.list('throttling/skip', name);
    }

    @GET
    @Path('circuitbreaker')
    public circuitBreaker(@QueryParam('name') name?: string): Promise<Array<string>> {
        return this.service.list('circuitbreaker', name);
    }

    @GET
    @Path('cors/origin')
    public corsOrigin(@QueryParam('name') name?: string): Promise<Array<string>> {
        return this.service.list('cors/origin', name);
    }

    @GET
    @Path('proxy/router')
    public proxyRouter(@QueryParam('name') name?: string): Promise<Array<string>> {
        return this.service.list('proxy/router', name);
    }

    @GET
    @Path('servicediscovery')
    public serviceDiscovery(@QueryParam('name') name?: string): Promise<Array<string>> {
        return this.service.list('servicediscovery', name);
    }

    @GET
    @Path('servicediscovery/provider')
    public serviceDiscoveryProvider(@QueryParam('name') name?: string): Promise<Array<string>> {
        return this.service.list('servicediscovery/provider', name);
    }

    @GET
    @Path('errorhandler')
    public errorHandler(@QueryParam('name') name?: string): Promise<Array<string>> {
        return this.service.list('errorhandler', name);
    }

    @GET
    @Path('request/logger')
    public requestLogger(@QueryParam('name') name?: string): Promise<Array<string>> {
        return this.service.list('request/logger', name);
    }

    @DELETE
    @Path('filters/:name')
    public removeFilter(@PathParam('name') name: string): Promise<void> {
        return this.service.remove('filter', name);
    }

    @DELETE
    @Path('interceptors/request/:name')
    public removeRequestInterceptor(@PathParam('name') name: string): Promise<void> {
        return this.service.remove('interceptor/request', name);
    }

    @DELETE
    @Path('interceptors/response/:name')
    public removeResponseInterceptor(@PathParam('name') name: string): Promise<void> {
        return this.service.remove('interceptor/response', name);
    }

    @DELETE
    @Path('authentication/strategies/:name')
    public removeAuthStrategy(@PathParam('name') name: string): Promise<void> {
        return this.service.remove('authentication/strategy', name);
    }

    @DELETE
    @Path('authentication/verify/:name')
    public removeAuthVerify(@PathParam('name') name: string): Promise<void> {
        return this.service.remove('authentication/verify', name);
    }

    @DELETE
    @Path('throttling/keyGenerators/:name')
    public removeThrottlingKeyGenerator(@PathParam('name') name: string): Promise<void> {
        return this.service.remove('throttling/keyGenerator', name);
    }

    @DELETE
    @Path('throttling/handlers/:name')
    public removeThrottlingHandler(@PathParam('name') name: string): Promise<void> {
        return this.service.remove('throttling/handler', name);
    }

    @DELETE
    @Path('throttling/skip/:name')
    public removeThrottlingSkip(@PathParam('name') name: string): Promise<void> {
        return this.service.remove('throttling/skip', name);
    }

    @DELETE
    @Path('circuitbreaker/:name')
    public removeCircuitBreaker(@PathParam('name') name: string): Promise<void> {
        return this.service.remove('circuitbreaker', name);
    }

    @DELETE
    @Path('cors/origin/:name')
    public removeCors(@PathParam('name') name: string): Promise<void> {
        return this.service.remove('cors/origin', name);
    }

    @DELETE
    @Path('proxy/router/:name')
    public removeProxyRouter(@PathParam('name') name: string): Promise<void> {
        return this.service.remove('proxy/router', name);
    }

    @DELETE
    @Path('servicediscovery/:name')
    public removeServiceDiscovery(@PathParam('name') name: string): Promise<void> {
        return this.service.remove('servicediscovery', name);
    }

    @DELETE
    @Path('servicediscovery/provider/:name')
    public removeServiceDiscoveryProvider(@PathParam('name') name: string): Promise<void> {
        return this.service.remove('servicediscovery/provider', name);
    }

    @DELETE
    @Path('errorhandler/:name')
    public removeErrorHandler(@PathParam('name') name: string): Promise<void> {
        return this.service.remove('errorhandler', name);
    }

    @DELETE
    @Path('request/logger/:name')
    public removeRequestLogger(@PathParam('name') name: string): Promise<void> {
        return this.service.remove('request/logger', name);
    }

    @PUT
    @Path('filters/:name')
    public updateFilter(@PathParam('name') name: string, @FileParam('file') file: Express.Multer.File): Promise<void> {
        return this.saveMiddleware('filter', file, name);
    }

    @PUT
    @Path('interceptors/request/:name')
    public updateRequestInterceptor(@PathParam('name') name: string, @FileParam('file') file: Express.Multer.File): Promise<void> {
        return this.saveMiddleware('interceptor/request', file, name);
    }

    @PUT
    @Path('interceptors/response/:name')
    public updateResponseInterceptor(@PathParam('name') name: string, @FileParam('file') file: Express.Multer.File): Promise<void> {
        return this.saveMiddleware('interceptor/response', file, name);
    }

    @PUT
    @Path('authentication/strategies/:name')
    public updateAuthStrategy(@PathParam('name') name: string, @FileParam('file') file: Express.Multer.File): Promise<void> {
        return this.saveMiddleware('authentication/strategy', file, name);
    }

    @PUT
    @Path('authentication/verify/:name')
    public updateAuthVerify(@PathParam('name') name: string, @FileParam('file') file: Express.Multer.File): Promise<void> {
        return this.saveMiddleware('authentication/verify', file, name);
    }

    @PUT
    @Path('throttling/keyGenerators/:name')
    public updateThrottlingKeyGenerator(@PathParam('name') name: string, @FileParam('file') file: Express.Multer.File): Promise<void> {
        return this.saveMiddleware('throttling/keyGenerator', file, name);
    }

    @PUT
    @Path('throttling/handlers/:name')
    public updateThrottlingHandler(@PathParam('name') name: string, @FileParam('file') file: Express.Multer.File): Promise<void> {
        return this.saveMiddleware('throttling/handler', file, name);
    }

    @PUT
    @Path('throttling/skip/:name')
    public updateThrottlingSkip(@PathParam('name') name: string, @FileParam('file') file: Express.Multer.File): Promise<void> {
        return this.saveMiddleware('throttling/skip', file, name);
    }

    @PUT
    @Path('circuitbreaker/:name')
    public updateCircuitBreaker(@PathParam('name') name: string, @FileParam('file') file: Express.Multer.File): Promise<void> {
        return this.saveMiddleware('circuitbreaker', file, name);
    }

    @PUT
    @Path('cors/origin/:name')
    public updateCors(@PathParam('name') name: string, @FileParam('file') file: Express.Multer.File): Promise<void> {
        return this.saveMiddleware('cors/origin', file, name);
    }

    @PUT
    @Path('proxy/router/:name')
    public updateProxyRouter(@PathParam('name') name: string, @FileParam('file') file: Express.Multer.File): Promise<void> {
        return this.saveMiddleware('proxy/router', file, name);
    }

    @PUT
    @Path('servicediscovery/:name')
    public updateServiceDiscovery(@PathParam('name') name: string, @FileParam('file') file: Express.Multer.File): Promise<void> {
        return this.saveMiddleware('servicediscovery', file, name);
    }

    @PUT
    @Path('servicediscovery/provider/:name')
    public updateServiceDiscoveryProvider(@PathParam('name') name: string, @FileParam('file') file: Express.Multer.File): Promise<void> {
        return this.saveMiddleware('servicediscovery/provider', file, name);
    }

    @PUT
    @Path('errorhandler/:name')
    public updateErrorHandler(@PathParam('name') name: string, @FileParam('file') file: Express.Multer.File): Promise<void> {
        return this.saveMiddleware('errorhandler', file, name);
    }

    @PUT
    @Path('request/logger/:name')
    public updateRequestLogger(@PathParam('name') name: string, @FileParam('file') file: Express.Multer.File): Promise<void> {
        return this.saveMiddleware('request/logger', file, name);
    }

    @GET
    @Path('filters/:name')
    public getFilter(@PathParam('name') name: string): Promise<Return.DownloadBinaryData> {
        return this.getMiddleware('filter', name);
    }

    @GET
    @Path('interceptors/request/:name')
    public getRequestInterceptor(@PathParam('name') name: string): Promise<Return.DownloadBinaryData> {
        return this.getMiddleware('interceptor/request', name);
    }

    @GET
    @Path('interceptors/response/:name')
    public getResponseInterceptor(@PathParam('name') name: string): Promise<Return.DownloadBinaryData> {
        return this.getMiddleware('interceptor/response', name);
    }

    @GET
    @Path('authentication/strategies/:name')
    public getAuthStrategy(@PathParam('name') name: string): Promise<Return.DownloadBinaryData> {
        return this.getMiddleware('authentication/strategy', name);
    }

    @GET
    @Path('authentication/verify/:name')
    public getAuthVerify(@PathParam('name') name: string): Promise<Return.DownloadBinaryData> {
        return this.getMiddleware('authentication/verify', name);
    }

    @GET
    @Path('throttling/keyGenerators/:name')
    public getThrottlingKeyGenerator(@PathParam('name') name: string): Promise<Return.DownloadBinaryData> {
        return this.getMiddleware('throttling/keyGenerator', name);
    }

    @GET
    @Path('throttling/handlers/:name')
    public getThrottlingHandler(@PathParam('name') name: string): Promise<Return.DownloadBinaryData> {
        return this.getMiddleware('throttling/handler', name);
    }

    @GET
    @Path('throttling/skip/:name')
    public getThrottlingSkip(@PathParam('name') name: string): Promise<Return.DownloadBinaryData> {
        return this.getMiddleware('throttling/skip', name);
    }

    @GET
    @Path('circuitbreaker/:name')
    public getCircuitBreakerMiddleware(@PathParam('name') name: string): Promise<Return.DownloadBinaryData> {
        return this.getMiddleware('circuitbreaker', name);
    }

    @GET
    @Path('cors/origin/:name')
    public getCorsMiddleware(@PathParam('name') name: string): Promise<Return.DownloadBinaryData> {
        return this.getMiddleware('cors/origin', name);
    }

    @GET
    @Path('proxy/router/:name')
    public getProxyRouterMiddleware(@PathParam('name') name: string): Promise<Return.DownloadBinaryData> {
        return this.getMiddleware('proxy/router', name);
    }

    @GET
    @Path('servicediscovery/:name')
    public getServiceDiscoveryMiddleware(@PathParam('name') name: string): Promise<Return.DownloadBinaryData> {
        return this.getMiddleware('servicediscovery', name);
    }

    @GET
    @Path('servicediscovery/provider/:name')
    public getServiceDiscoveryProviderMiddleware(@PathParam('name') name: string): Promise<Return.DownloadBinaryData> {
        return this.getMiddleware('servicediscovery/provider', name);
    }

    @GET
    @Path('errorhandler/:name')
    public getErrorHandlerMiddleware(@PathParam('name') name: string): Promise<Return.DownloadBinaryData> {
        return this.getMiddleware('errorhandler', name);
    }

    @GET
    @Path('request/logger/:name')
    public getRequestLoggerMiddleware(@PathParam('name') name: string): Promise<Return.DownloadBinaryData> {
        return this.getMiddleware('request/logger', name);
    }

    @POST
    @Path('filters')
    public addFilter(@FileParam('file') file: Express.Multer.File, @FormParam('name') name: string) {
        return this.addMiddleware('filter', file, name);
    }

    @POST
    @Path('interceptors/request')
    public addRequestInterceptor(@FileParam('file') file: Express.Multer.File, @FormParam('name') name: string) {
        return this.addMiddleware('interceptor/request', file, name, 'interceptors/request');
    }

    @POST
    @Path('interceptors/response')
    public addResponseInterceptor(@FileParam('file') file: Express.Multer.File, @FormParam('name') name: string) {
        return this.addMiddleware('interceptor/response', file, name, 'interceptors/response');
    }

    @POST
    @Path('authentication/strategies')
    public addAuthStrategy(@FileParam('file') file: Express.Multer.File, @FormParam('name') name: string) {
        return this.addMiddleware('authentication/strategy', file, name);
    }

    @POST
    @Path('authentication/verify')
    public addAuthVerify(@FileParam('file') file: Express.Multer.File, @FormParam('name') name: string) {
        return this.addMiddleware('authentication/verify', file, name);
    }

    @POST
    @Path('throttling/keyGenerators')
    public addThrottlingKeyGenerator(@FileParam('file') file: Express.Multer.File, @FormParam('name') name: string) {
        return this.addMiddleware('throttling/keyGenerator', file, name, 'throttling/keyGenerators');
    }

    @POST
    @Path('throttling/handlers')
    public addThrottlingHander(@FileParam('file') file: Express.Multer.File, @FormParam('name') name: string) {
        return this.addMiddleware('throttling/handler', file, name, 'throttling/handlers');
    }

    @POST
    @Path('throttling/skip')
    public addThrottlingSkip(@FileParam('file') file: Express.Multer.File, @FormParam('name') name: string) {
        return this.addMiddleware('throttling/skip', file, name);
    }

    @POST
    @Path('circuitbreaker')
    public addCircuitBreaker(@FileParam('file') file: Express.Multer.File, @FormParam('name') name: string) {
        return this.addMiddleware('circuitbreaker', file, name);
    }

    @POST
    @Path('cors/origin')
    public addCors(@FileParam('file') file: Express.Multer.File, @FormParam('name') name: string) {
        return this.addMiddleware('cors/origin', file, name);
    }

    @POST
    @Path('proxy/router')
    public addProxyRouter(@FileParam('file') file: Express.Multer.File, @FormParam('name') name: string) {
        return this.addMiddleware('proxy/router', file, name);
    }

    @POST
    @Path('servicediscovery')
    public addServiceDiscovery(@FileParam('file') file: Express.Multer.File, @FormParam('name') name: string) {
        return this.addMiddleware('servicediscovery', file, name);
    }

    @POST
    @Path('servicediscovery/provider')
    public addServiceDiscoveryProvider(@FileParam('file') file: Express.Multer.File, @FormParam('name') name: string) {
        return this.addMiddleware('servicediscovery/provider', file, name);
    }

    @POST
    @Path('errorhandler')
    public addErrorHandler(@FileParam('file') file: Express.Multer.File, @FormParam('name') name: string) {
        return this.addMiddleware('errorhandler', file, name);
    }

    @POST
    @Path('request/logger')
    public addRequestLogger(@FileParam('file') file: Express.Multer.File, @FormParam('name') name: string) {
        return this.addMiddleware('request/logger', file, name);
    }

    private async getMiddleware(type: string, name: string): Promise<Return.DownloadBinaryData> {
        try {
            const value = await this.service.read(type, name);
            return new Return.DownloadBinaryData(value, 'application/javascript', name + '.js');
        } catch (err) {
            throw new Errors.NotFoundError();
        }
    }

    private async addMiddleware(type: string, file: Express.Multer.File, name: string, basePath?: string): Promise<Return.NewResource<void>> {
        await this.service.add(type, name, file.buffer);
        return new Return.NewResource<void>(path.join(basePath || type, name));
    }

    private async saveMiddleware(type: string, file: Express.Multer.File, name: string): Promise<void> {
        return await this.service.update(type, name, file.buffer);
    }
}
