'use strict';

import { Path, GET, POST, DELETE, PUT, PathParam, QueryParam, FileParam, FormParam, Errors, Return } from 'typescript-rest';
import * as path from 'path';
import { MiddlewareService } from '../../service/middleware';
import { Inject } from 'typescript-ioc';
import * as swagger from 'typescript-rest-swagger';

@Path('middleware')
@swagger.Tags('Middleware')
@swagger.Security('Bearer')
export class MiddlewareRest {
    @Inject private service: MiddlewareService;

    @GET
    @Path('filters')
    filters( @QueryParam('name') name?: string): Promise<Array<string>> {
        return this.service.list('filter', name);
    }

    @GET
    @Path('interceptors/request')
    requestInterceptors( @QueryParam('name') name?: string): Promise<Array<string>> {
        return this.service.list('interceptor/request', name);
    }

    @GET
    @Path('interceptors/response')
    responseInterceptors( @QueryParam('name') name?: string): Promise<Array<string>> {
        return this.service.list('interceptor/response', name);
    }

    @GET
    @Path('authentication/strategies')
    authStrategies( @QueryParam('name') name?: string): Promise<Array<string>> {
        return this.service.list('authentication/strategy', name);
    }

    @GET
    @Path('authentication/verify')
    authVerify( @QueryParam('name') name?: string): Promise<Array<string>> {
        return this.service.list('authentication/verify', name);
    }

    @GET
    @Path('throttling/keyGenerators')
    throttlingKeyGenerator( @QueryParam('name') name?: string): Promise<Array<string>> {
        return this.service.list('throttling/keyGenerator', name);
    }

    @GET
    @Path('throttling/handlers')
    throttlingHandler( @QueryParam('name') name?: string): Promise<Array<string>> {
        return this.service.list('throttling/handler', name);
    }

    @GET
    @Path('throttling/skip')
    throttlingSkip( @QueryParam('name') name?: string): Promise<Array<string>> {
        return this.service.list('throttling/skip', name);
    }

    @GET
    @Path('circuitbreaker')
    circuitBreaker( @QueryParam('name') name?: string): Promise<Array<string>> {
        return this.service.list('circuitbreaker', name);
    }

    @GET
    @Path('cors/origin')
    corsOrigin( @QueryParam('name') name?: string): Promise<Array<string>> {
        return this.service.list('cors/origin', name);
    }

    @GET
    @Path('proxy/router')
    proxyRouter( @QueryParam('name') name?: string): Promise<Array<string>> {
        return this.service.list('proxy/router', name);
    }

    @GET
    @Path('servicediscovery')
    serviceDiscovery( @QueryParam('name') name?: string): Promise<Array<string>> {
        return this.service.list('servicediscovery', name);
    }

    @GET
    @Path('servicediscovery/provider')
    serviceDiscoveryProvider( @QueryParam('name') name?: string): Promise<Array<string>> {
        return this.service.list('servicediscovery/provider', name);
    }

    @GET
    @Path('errorhandler')
    errorHandler( @QueryParam('name') name?: string): Promise<Array<string>> {
        return this.service.list('errorhandler', name);
    }

    @GET
    @Path('request/logger')
    requestLogger( @QueryParam('name') name?: string): Promise<Array<string>> {
        return this.service.list('request/logger', name);
    }

    @DELETE
    @Path('filters/:name')
    removeFilter( @PathParam('name') name: string): Promise<void> {
        return this.service.remove('filter', name);
    }

    @DELETE
    @Path('interceptors/request/:name')
    removeRequestInterceptor( @PathParam('name') name: string): Promise<void> {
        return this.service.remove('interceptor/request', name);
    }

    @DELETE
    @Path('interceptors/response/:name')
    removeResponseInterceptor( @PathParam('name') name: string): Promise<void> {
        return this.service.remove('interceptor/response', name);
    }

    @DELETE
    @Path('authentication/strategies/:name')
    removeAuthStrategy( @PathParam('name') name: string): Promise<void> {
        return this.service.remove('authentication/strategy', name);
    }

    @DELETE
    @Path('authentication/verify/:name')
    removeAuthVerify( @PathParam('name') name: string): Promise<void> {
        return this.service.remove('authentication/verify', name);
    }

    @DELETE
    @Path('throttling/keyGenerators/:name')
    removeThrottlingKeyGenerator( @PathParam('name') name: string): Promise<void> {
        return this.service.remove('throttling/keyGenerator', name);
    }

    @DELETE
    @Path('throttling/handlers/:name')
    removeThrottlingHandler( @PathParam('name') name: string): Promise<void> {
        return this.service.remove('throttling/handler', name);
    }

    @DELETE
    @Path('throttling/skip/:name')
    removeThrottlingSkip( @PathParam('name') name: string): Promise<void> {
        return this.service.remove('throttling/skip', name);
    }

    @DELETE
    @Path('circuitbreaker/:name')
    removeCircuitBreaker( @PathParam('name') name: string): Promise<void> {
        return this.service.remove('circuitbreaker', name);
    }

    @DELETE
    @Path('cors/origin/:name')
    removeCors( @PathParam('name') name: string): Promise<void> {
        return this.service.remove('cors/origin', name);
    }

    @DELETE
    @Path('proxy/router/:name')
    removeProxyRouter( @PathParam('name') name: string): Promise<void> {
        return this.service.remove('proxy/router', name);
    }

    @DELETE
    @Path('servicediscovery/:name')
    removeServiceDiscovery( @PathParam('name') name: string): Promise<void> {
        return this.service.remove('servicediscovery', name);
    }

    @DELETE
    @Path('servicediscovery/provider/:name')
    removeServiceDiscoveryProvider( @PathParam('name') name: string): Promise<void> {
        return this.service.remove('servicediscovery/provider', name);
    }

    @DELETE
    @Path('errorhandler/:name')
    removeErrorHandler( @PathParam('name') name: string): Promise<void> {
        return this.service.remove('errorhandler', name);
    }

    @DELETE
    @Path('request/logger/:name')
    removeRequestLogger( @PathParam('name') name: string): Promise<void> {
        return this.service.remove('request/logger', name);
    }

    @PUT
    @Path('filters/:name')
    updateFilter( @PathParam('name') name: string, @FileParam('file') file: Express.Multer.File): Promise<void> {
        return this.saveMiddleware('filter', file, name);
    }

    @PUT
    @Path('interceptors/request/:name')
    updateRequestInterceptor( @PathParam('name') name: string, @FileParam('file') file: Express.Multer.File): Promise<void> {
        return this.saveMiddleware('interceptor/request', file, name);
    }

    @PUT
    @Path('interceptors/response/:name')
    updateResponseInterceptor( @PathParam('name') name: string, @FileParam('file') file: Express.Multer.File): Promise<void> {
        return this.saveMiddleware('interceptor/response', file, name);
    }

    @PUT
    @Path('authentication/strategies/:name')
    updateAuthStrategy( @PathParam('name') name: string, @FileParam('file') file: Express.Multer.File): Promise<void> {
        return this.saveMiddleware('authentication/strategy', file, name);
    }

    @PUT
    @Path('authentication/verify/:name')
    updateAuthVerify( @PathParam('name') name: string, @FileParam('file') file: Express.Multer.File): Promise<void> {
        return this.saveMiddleware('authentication/verify', file, name);
    }

    @PUT
    @Path('throttling/keyGenerators/:name')
    updateThrottlingKeyGenerator( @PathParam('name') name: string, @FileParam('file') file: Express.Multer.File): Promise<void> {
        return this.saveMiddleware('throttling/keyGenerator', file, name);
    }

    @PUT
    @Path('throttling/handlers/:name')
    updateThrottlingHandler( @PathParam('name') name: string, @FileParam('file') file: Express.Multer.File): Promise<void> {
        return this.saveMiddleware('throttling/handler', file, name);
    }

    @PUT
    @Path('throttling/skip/:name')
    updateThrottlingSkip( @PathParam('name') name: string, @FileParam('file') file: Express.Multer.File): Promise<void> {
        return this.saveMiddleware('throttling/skip', file, name);
    }

    @PUT
    @Path('circuitbreaker/:name')
    updateCircuitBreaker( @PathParam('name') name: string, @FileParam('file') file: Express.Multer.File): Promise<void> {
        return this.saveMiddleware('circuitbreaker', file, name);
    }

    @PUT
    @Path('cors/origin/:name')
    updateCors( @PathParam('name') name: string, @FileParam('file') file: Express.Multer.File): Promise<void> {
        return this.saveMiddleware('cors/origin', file, name);
    }

    @PUT
    @Path('proxy/router/:name')
    updateProxyRouter( @PathParam('name') name: string, @FileParam('file') file: Express.Multer.File): Promise<void> {
        return this.saveMiddleware('proxy/router', file, name);
    }

    @PUT
    @Path('servicediscovery/:name')
    updateServiceDiscovery( @PathParam('name') name: string, @FileParam('file') file: Express.Multer.File): Promise<void> {
        return this.saveMiddleware('servicediscovery', file, name);
    }

    @PUT
    @Path('servicediscovery/provider/:name')
    updateServiceDiscoveryProvider( @PathParam('name') name: string, @FileParam('file') file: Express.Multer.File): Promise<void> {
        return this.saveMiddleware('servicediscovery/provider', file, name);
    }

    @PUT
    @Path('errorhandler/:name')
    updateErrorHandler( @PathParam('name') name: string, @FileParam('file') file: Express.Multer.File): Promise<void> {
        return this.saveMiddleware('errorhandler', file, name);
    }

    @PUT
    @Path('request/logger/:name')
    updateRequestLogger( @PathParam('name') name: string, @FileParam('file') file: Express.Multer.File): Promise<void> {
        return this.saveMiddleware('request/logger', file, name);
    }

    @GET
    @Path('filters/:name')
    getFilter( @PathParam('name') name: string): Promise<Return.DownloadBinaryData> {
        return this.getMiddleware('filter', name);
    }

    @GET
    @Path('interceptors/request/:name')
    getRequestInterceptor( @PathParam('name') name: string): Promise<Return.DownloadBinaryData> {
        return this.getMiddleware('interceptor/request', name);
    }

    @GET
    @Path('interceptors/response/:name')
    getResponseInterceptor( @PathParam('name') name: string): Promise<Return.DownloadBinaryData> {
        return this.getMiddleware('interceptor/response', name);
    }

    @GET
    @Path('authentication/strategies/:name')
    getAuthStrategy( @PathParam('name') name: string): Promise<Return.DownloadBinaryData> {
        return this.getMiddleware('authentication/strategy', name);
    }

    @GET
    @Path('authentication/verify/:name')
    getAuthVerify( @PathParam('name') name: string): Promise<Return.DownloadBinaryData> {
        return this.getMiddleware('authentication/verify', name);
    }

    @GET
    @Path('throttling/keyGenerators/:name')
    getThrottlingKeyGenerator( @PathParam('name') name: string): Promise<Return.DownloadBinaryData> {
        return this.getMiddleware('throttling/keyGenerator', name);
    }

    @GET
    @Path('throttling/handlers/:name')
    getThrottlingHandler( @PathParam('name') name: string): Promise<Return.DownloadBinaryData> {
        return this.getMiddleware('throttling/handler', name);
    }

    @GET
    @Path('throttling/skip/:name')
    getThrottlingSkip( @PathParam('name') name: string): Promise<Return.DownloadBinaryData> {
        return this.getMiddleware('throttling/skip', name);
    }

    @GET
    @Path('circuitbreaker/:name')
    getCircuitBreakerMiddleware( @PathParam('name') name: string): Promise<Return.DownloadBinaryData> {
        return this.getMiddleware('circuitbreaker', name);
    }

    @GET
    @Path('cors/origin/:name')
    getCorsMiddleware( @PathParam('name') name: string): Promise<Return.DownloadBinaryData> {
        return this.getMiddleware('cors/origin', name);
    }

    @GET
    @Path('proxy/router/:name')
    getProxyRouterMiddleware( @PathParam('name') name: string): Promise<Return.DownloadBinaryData> {
        return this.getMiddleware('proxy/router', name);
    }

    @GET
    @Path('servicediscovery/:name')
    getServiceDiscoveryMiddleware( @PathParam('name') name: string): Promise<Return.DownloadBinaryData> {
        return this.getMiddleware('servicediscovery', name);
    }

    @GET
    @Path('servicediscovery/provider/:name')
    getServiceDiscoveryProviderMiddleware( @PathParam('name') name: string): Promise<Return.DownloadBinaryData> {
        return this.getMiddleware('servicediscovery/provider', name);
    }

    @GET
    @Path('errorhandler/:name')
    getErrorHandlerMiddleware( @PathParam('name') name: string): Promise<Return.DownloadBinaryData> {
        return this.getMiddleware('errorhandler', name);
    }

    @GET
    @Path('request/logger/:name')
    getRequestLoggerMiddleware( @PathParam('name') name: string): Promise<Return.DownloadBinaryData> {
        return this.getMiddleware('request/logger', name);
    }

    @POST
    @Path('filters')
    addFilter( @FileParam('file') file: Express.Multer.File, @FormParam('name') name: string) {
        return this.addMiddleware('filter', file, name);
    }

    @POST
    @Path('interceptors/request')
    addRequestInterceptor( @FileParam('file') file: Express.Multer.File, @FormParam('name') name: string) {
        return this.addMiddleware('interceptor/request', file, name, 'interceptors/request');
    }

    @POST
    @Path('interceptors/response')
    addResponseInterceptor( @FileParam('file') file: Express.Multer.File, @FormParam('name') name: string) {
        return this.addMiddleware('interceptor/response', file, name, 'interceptors/response');
    }

    @POST
    @Path('authentication/strategies')
    addAuthStrategy( @FileParam('file') file: Express.Multer.File, @FormParam('name') name: string) {
        return this.addMiddleware('authentication/strategy', file, name);
    }

    @POST
    @Path('authentication/verify')
    addAuthVerify( @FileParam('file') file: Express.Multer.File, @FormParam('name') name: string) {
        return this.addMiddleware('authentication/verify', file, name);
    }

    @POST
    @Path('throttling/keyGenerators')
    addThrottlingKeyGenerator( @FileParam('file') file: Express.Multer.File, @FormParam('name') name: string) {
        return this.addMiddleware('throttling/keyGenerator', file, name, 'throttling/keyGenerators');
    }

    @POST
    @Path('throttling/handlers')
    addThrottlingHander( @FileParam('file') file: Express.Multer.File, @FormParam('name') name: string) {
        return this.addMiddleware('throttling/handler', file, name, 'throttling/handlers');
    }

    @POST
    @Path('throttling/skip')
    addThrottlingSkip( @FileParam('file') file: Express.Multer.File, @FormParam('name') name: string) {
        return this.addMiddleware('throttling/skip', file, name);
    }

    @POST
    @Path('circuitbreaker')
    addCircuitBreaker( @FileParam('file') file: Express.Multer.File, @FormParam('name') name: string) {
        return this.addMiddleware('circuitbreaker', file, name);
    }

    @POST
    @Path('cors/origin')
    addCors( @FileParam('file') file: Express.Multer.File, @FormParam('name') name: string) {
        return this.addMiddleware('cors/origin', file, name);
    }

    @POST
    @Path('proxy/router')
    addProxyRouter( @FileParam('file') file: Express.Multer.File, @FormParam('name') name: string) {
        return this.addMiddleware('proxy/router', file, name);
    }

    @POST
    @Path('servicediscovery')
    addServiceDiscovery( @FileParam('file') file: Express.Multer.File, @FormParam('name') name: string) {
        return this.addMiddleware('servicediscovery', file, name);
    }

    @POST
    @Path('servicediscovery/provider')
    addServiceDiscoveryProvider( @FileParam('file') file: Express.Multer.File, @FormParam('name') name: string) {
        return this.addMiddleware('servicediscovery/provider', file, name);
    }

    @POST
    @Path('errorhandler')
    addErrorHandler( @FileParam('file') file: Express.Multer.File, @FormParam('name') name: string) {
        return this.addMiddleware('errorhandler', file, name);
    }

    @POST
    @Path('request/logger')
    addRequestLogger( @FileParam('file') file: Express.Multer.File, @FormParam('name') name: string) {
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
        try {
            await this.service.add(type, name, file.buffer);
            return new Return.NewResource<void>(path.join(basePath || type, name));
        } catch(err) {
            throw new Errors.InternalServerError(`Error saving ${type}.`);
        }
    }

    private async saveMiddleware(type: string, file: Express.Multer.File, name: string): Promise<void> {
        try {
            return await this.service.save('servicediscovery', name, file.buffer);
        } catch(err) {
            throw new Errors.InternalServerError(`Error saving ${type}.`);
        }
    }
}
