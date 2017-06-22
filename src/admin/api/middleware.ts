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
    filters(@QueryParam('name') name?: string): Promise<Array<string>> {
        return this.service.list('filter', name);
    }

    @GET
    @Path('interceptors/request')
    requestInterceptors(@QueryParam('name') name?: string): Promise<Array<string>> {
        return this.service.list('interceptor/request', name);
    }

    @GET
    @Path('interceptors/response')
    responseInterceptors(@QueryParam('name') name?: string): Promise<Array<string>> {
        return this.service.list('interceptor/response', name);
    }

    @GET
    @Path('authentication/strategies')
    authStrategies(@QueryParam('name') name?: string): Promise<Array<string>> {
        return this.service.list('authentication/strategy', name);
    }

    @GET
    @Path('authentication/verify')
    authVerify(@QueryParam('name') name?: string): Promise<Array<string>> {
        return this.service.list('authentication/verify', name);
    }

    @GET
    @Path('throttling/keyGenerators')
    throttlingKeyGenerator(@QueryParam('name') name?: string): Promise<Array<string>> {
        return this.service.list('throttling/keyGenerator', name);
    }

    @GET
    @Path('throttling/handlers')
    throttlingHandler(@QueryParam('name') name?: string): Promise<Array<string>> {
        return this.service.list('throttling/handler', name);
    }

    @GET
    @Path('throttling/skip')
    throttlingSkip(@QueryParam('name') name?: string): Promise<Array<string>> {
        return this.service.list('throttling/skip', name);
    }

    @GET
    @Path('circuitbreaker')
    circuitBreaker(@QueryParam('name') name?: string): Promise<Array<string>> {
        return this.service.list('circuitbreaker', name);
    }

    @GET
    @Path('cors')
    corsOrigin(@QueryParam('name') name?: string): Promise<Array<string>> {
        return this.service.list('cors/origin', name);
    }

    @GET
    @Path('proxy/router')
    proxyRouter(@QueryParam('name') name?: string): Promise<Array<string>> {
        return this.service.list('proxy/router', name);
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
    @Path('cors/:name')
    removeCors( @PathParam('name') name: string): Promise<void> {
        return this.service.remove('cors/origin', name);
    }

    @DELETE
    @Path('proxy/router/:name')
    removeProxyRouter( @PathParam('name') name: string): Promise<void> {
        return this.service.remove('proxy/router', name);
    }

    @PUT
    @Path('filters/:name')
    updateFilter( @PathParam('name') name: string, @FileParam('file') file: Express.Multer.File): Promise<void> {
        return this.service.save('filter', name, file.buffer);
    }

    @PUT
    @Path('interceptors/request/:name')
    updateRequestInterceptor( @PathParam('name') name: string, @FileParam('file') file: Express.Multer.File): Promise<void> {
        return this.service.save('interceptor/request', name, file.buffer);
    }

    @PUT
    @Path('interceptors/response/:name')
    updateResponseInterceptor( @PathParam('name') name: string, @FileParam('file') file: Express.Multer.File): Promise<void> {
        return this.service.save('interceptor/response', name, file.buffer);
    }

    @PUT
    @Path('authentication/strategies/:name')
    updateAuthStrategy( @PathParam('name') name: string, @FileParam('file') file: Express.Multer.File): Promise<void> {
        return this.service.save('authentication/strategy', name, file.buffer);
    }

    @PUT
    @Path('authentication/verify/:name')
    updateAuthVerify( @PathParam('name') name: string, @FileParam('file') file: Express.Multer.File): Promise<void> {
        return this.service.save('authentication/verify', name, file.buffer);
    }

    @PUT
    @Path('throttling/keyGenerators/:name')
    updateThrottlingKeyGenerator( @PathParam('name') name: string, @FileParam('file') file: Express.Multer.File): Promise<void> {
        return this.service.save('throttling/keyGenerator', name, file.buffer);
    }

    @PUT
    @Path('throttling/handlers/:name')
    updateThrottlingHandler( @PathParam('name') name: string, @FileParam('file') file: Express.Multer.File): Promise<void> {
        return this.service.save('throttling/handler', name, file.buffer);
    }

    @PUT
    @Path('throttling/skip/:name')
    updateThrottlingSkip( @PathParam('name') name: string, @FileParam('file') file: Express.Multer.File): Promise<void> {
        return this.service.save('throttling/skip', name, file.buffer);
    }

    @PUT
    @Path('circuitbreaker/:name')
    updateCircuitBreaker( @PathParam('name') name: string, @FileParam('file') file: Express.Multer.File): Promise<void> {
        return this.service.save('circuitbreaker', name, file.buffer);
    }

    @PUT
    @Path('cors/:name')
    updateCors( @PathParam('name') name: string, @FileParam('file') file: Express.Multer.File): Promise<void> {
        return this.service.save('cors/origin', name, file.buffer);
    }

    @PUT
    @Path('proxy/router/:name')
    updateProxyRouter( @PathParam('name') name: string, @FileParam('file') file: Express.Multer.File): Promise<void> {
        return this.service.save('proxy/router', name, file.buffer);
    }

    @GET
    @Path('filters/:name')
    getFilter( @PathParam('name') name: string): Promise<Return.DownloadBinaryData> {
        return new Promise<Return.DownloadBinaryData>((resolve, reject) => {
            // FIXME: 'read' should return a Buffer
            this.service.read('filter', name)
                .then(value => {
                    resolve(new Return.DownloadBinaryData(value, 'application/javascript', name + '.js'));
                })
                .catch(err => {
                    reject(new Errors.NotFoundError());
                });
        });
    }

    @GET
    @Path('interceptors/request/:name')
    getRequestInterceptor( @PathParam('name') name: string): Promise<Return.DownloadBinaryData> {
        return new Promise<Return.DownloadBinaryData>((resolve, reject) => {
            this.service.read('interceptor/request', name)
                .then(value => {
                    resolve(new Return.DownloadBinaryData(value, 'application/javascript', name + '.js'));
                })
                .catch(err => {
                    reject(new Errors.NotFoundError());
                });
        });
    }

    @GET
    @Path('interceptors/response/:name')
    getResponseInterceptor( @PathParam('name') name: string): Promise<Return.DownloadBinaryData> {
        return new Promise<Return.DownloadBinaryData>((resolve, reject) => {
            this.service.read('interceptor/response', name)
                .then(value => {
                    resolve(new Return.DownloadBinaryData(value, 'application/javascript', name + '.js'));
                })
                .catch(err => {
                    reject(new Errors.NotFoundError());
                });
        });
    }

    @GET
    @Path('authentication/strategies/:name')
    getAuthStrategy( @PathParam('name') name: string): Promise<Return.DownloadBinaryData> {
        return new Promise<Return.DownloadBinaryData>((resolve, reject) => {
            this.service.read('authentication/strategy', name)
                .then(value => {
                    resolve(new Return.DownloadBinaryData(value, 'application/javascript', name + '.js'));
                })
                .catch(err => {
                    reject(new Errors.NotFoundError());
                });
        });
    }

    @GET
    @Path('authentication/verify/:name')
    getAuthVerify( @PathParam('name') name: string): Promise<Return.DownloadBinaryData> {
        return new Promise<Return.DownloadBinaryData>((resolve, reject) => {
            this.service.read('authentication/verify', name)
                .then(value => {
                    resolve(new Return.DownloadBinaryData(value, 'application/javascript', name + '.js'));
                })
                .catch(err => {
                    reject(new Errors.NotFoundError());
                });
        });
    }

    @GET
    @Path('throttling/keyGenerators/:name')
    getThrottlingKeyGenerator( @PathParam('name') name: string): Promise<Return.DownloadBinaryData> {
        return new Promise<Return.DownloadBinaryData>((resolve, reject) => {
            this.service.read('throttling/keyGenerator', name)
                .then(value => {
                    resolve(new Return.DownloadBinaryData(value, 'application/javascript', name + '.js'));
                })
                .catch(err => {
                    reject(new Errors.NotFoundError());
                });
        });
    }

    @GET
    @Path('throttling/handlers/:name')
    getThrottlingHandler( @PathParam('name') name: string): Promise<Return.DownloadBinaryData> {
        return new Promise<Return.DownloadBinaryData>((resolve, reject) => {
            this.service.read('throttling/handler', name)
                .then(value => {
                    resolve(new Return.DownloadBinaryData(value, 'application/javascript', name + '.js'));
                })
                .catch(err => {
                    reject(new Errors.NotFoundError());
                });
        });
    }

    @GET
    @Path('throttling/skip/:name')
    getThrottlingSkip( @PathParam('name') name: string): Promise<Return.DownloadBinaryData> {
        return new Promise<Return.DownloadBinaryData>((resolve, reject) => {
            this.service.read('throttling/skip', name)
                .then(value => {
                    resolve(new Return.DownloadBinaryData(value, 'application/javascript', name + '.js'));
                })
                .catch(err => {
                    reject(new Errors.NotFoundError());
                });
        });
    }

    @GET
    @Path('circuitbreaker/:name')
    getCircuitBreakerMiddleware( @PathParam('name') name: string): Promise<Return.DownloadBinaryData> {
        return new Promise<Return.DownloadBinaryData>((resolve, reject) => {
            this.service.read('circuitbreaker', name)
                .then(value => {
                    resolve(new Return.DownloadBinaryData(value, 'application/javascript', name + '.js'));
                })
                .catch(err => {
                    reject(new Errors.NotFoundError());
                });
        });
    }

    @GET
    @Path('cors/:name')
    getCorsMiddleware( @PathParam('name') name: string): Promise<Return.DownloadBinaryData> {
        return new Promise<Return.DownloadBinaryData>((resolve, reject) => {
            this.service.read('cors/origin', name)
                .then(value => {
                    resolve(new Return.DownloadBinaryData(value, 'application/javascript', name + '.js'));
                })
                .catch(err => {
                    reject(new Errors.NotFoundError());
                });
        });
    }

    @GET
    @Path('proxy/router/:name')
    getProxyRouterMiddleware( @PathParam('name') name: string): Promise<Return.DownloadBinaryData> {
        return new Promise<Return.DownloadBinaryData>((resolve, reject) => {
            this.service.read('proxy/router', name)
                .then(value => {
                    resolve(new Return.DownloadBinaryData(value, 'application/javascript', name + '.js'));
                })
                .catch(err => {
                    reject(new Errors.NotFoundError());
                });
        });
    }

    @POST
    @Path('filters')
    addFilter( @FileParam('file') file: Express.Multer.File,
        @FormParam('name') name: string) {
        return new Promise<Return.NewResource<void>>((resolve, reject) => {
            this.service.add('filter', name, file.buffer)
                .then(value => {
                    resolve(new Return.NewResource<void>(path.join('filter', name)));
                })
                .catch(err => {
                    reject(new Errors.InternalServerError('Error saving filter.'));
                });
        });
    }

    @POST
    @Path('interceptors/request')
    addRequestInterceptor( @FileParam('file') file: Express.Multer.File,
        @FormParam('name') name: string) {
        return new Promise<Return.NewResource<void>>((resolve, reject) => {
            this.service.add('interceptor/request', name, file.buffer)
                .then(value => {
                    resolve(new Return.NewResource<void>(path.join('interceptors/request', name)));
                })
                .catch(err => {
                    reject(new Errors.InternalServerError('Error saving interceptor.'));
                });
        });
    }

    @POST
    @Path('interceptors/response')
    addResponseInterceptor( @FileParam('file') file: Express.Multer.File,
        @FormParam('name') name: string) {
        return new Promise<Return.NewResource<void>>((resolve, reject) => {
            this.service.add('interceptor/response', name, file.buffer)
                .then(value => {
                    resolve(new Return.NewResource<void>(path.join('interceptors/response', name)));
                })
                .catch(err => {
                    reject(new Errors.InternalServerError('Error saving interceptor.'));
                });
        });
    }

    @POST
    @Path('authentication/strategies')
    addAuthStrategy( @FileParam('file') file: Express.Multer.File,
        @FormParam('name') name: string) {
        return new Promise<Return.NewResource<void>>((resolve, reject) => {
            this.service.add('authentication/strategy', name, file.buffer)
                .then(value => {
                    resolve(new Return.NewResource<void>(path.join('authentication/strategy', name)));
                })
                .catch(err => {
                    reject(new Errors.InternalServerError('Error saving strategy.'));
                });
        });
    }

    @POST
    @Path('authentication/verify')
    addAuthVerify( @FileParam('file') file: Express.Multer.File,
        @FormParam('name') name: string) {
        return new Promise<Return.NewResource<void>>((resolve, reject) => {
            this.service.add('authentication/verify', name, file.buffer)
                .then(value => {
                    resolve(new Return.NewResource<void>(path.join('authentication/verify', name)));
                })
                .catch(err => {
                    reject(new Errors.InternalServerError('Error saving verify function.'));
                });
        });
    }

    @POST
    @Path('throttling/keyGenerators')
    addThrottlingKeyGenerator( @FileParam('file') file: Express.Multer.File,
        @FormParam('name') name: string) {
        return new Promise<Return.NewResource<void>>((resolve, reject) => {
            this.service.add('throttling/keyGenerator', name, file.buffer)
                .then(value => {
                    resolve(new Return.NewResource<void>(path.join('throttling/keyGenerators', name)));
                })
                .catch(err => {
                    reject(new Errors.InternalServerError('Error saving keyGenerator.'));
                });
        });
    }

    @POST
    @Path('throttling/handlers')
    addThrottlingHander( @FileParam('file') file: Express.Multer.File,
        @FormParam('name') name: string) {
        return new Promise<Return.NewResource<void>>((resolve, reject) => {
            this.service.add('throttling/handler', name, file.buffer)
                .then(value => {
                    resolve(new Return.NewResource<void>(path.join('throttling/handlers', name)));
                })
                .catch(err => {
                    reject(new Errors.InternalServerError('Error saving handler.'));
                });
        });
    }

    @POST
    @Path('throttling/skip')
    addThrottlingSkip( @FileParam('file') file: Express.Multer.File,
        @FormParam('name') name: string) {
        return new Promise<Return.NewResource<void>>((resolve, reject) => {
            this.service.add('throttling/skip', name, file.buffer)
                .then(value => {
                    resolve(new Return.NewResource<void>(path.join('throttling/skip', name)));
                })
                .catch(err => {
                    reject(new Errors.InternalServerError('Error saving handler.'));
                });
        });
    }

    @POST
    @Path('circuitbreaker')
    addCircuitBreaker( @FileParam('file') file: Express.Multer.File,
        @FormParam('name') name: string) {
        return new Promise<Return.NewResource<void>>((resolve, reject) => {
            this.service.add('circuitbreaker', name, file.buffer)
                .then(value => {
                    resolve(new Return.NewResource<void>(path.join('circuitbreaker', name)));
                })
                .catch(err => {
                    reject(new Errors.InternalServerError('Error saving handler.'));
                });
        });
    }

    @POST
    @Path('cors')
    addCors( @FileParam('file') file: Express.Multer.File,
        @FormParam('name') name: string) {
        return new Promise<Return.NewResource<void>>((resolve, reject) => {
            this.service.add('cors/origin', name, file.buffer)
                .then(value => {
                    resolve(new Return.NewResource<void>(path.join('cors', name)));
                })
                .catch(err => {
                    reject(new Errors.InternalServerError('Error saving handler.'));
                });
        });
    }

    @POST
    @Path('proxy/router')
    addProxyRouter( @FileParam('file') file: Express.Multer.File,
        @FormParam('name') name: string) {
        return new Promise<Return.NewResource<void>>((resolve, reject) => {
            this.service.add('proxy/router', name, file.buffer)
                .then(value => {
                    resolve(new Return.NewResource<void>(path.join('proxy/router', name)));
                })
                .catch(err => {
                    reject(new Errors.InternalServerError('Error saving handler.'));
                });
        });
    }
}
