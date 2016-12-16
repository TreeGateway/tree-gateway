"use strict";

import {Path, GET, POST, DELETE, PUT, PathParam, FileParam, FormParam, Errors, Return,
        Accept} from "typescript-rest";
import "es6-promise";
import * as path from "path";
import {MiddlewareService} from "../service/middleware";

@Path('middleware')
export class MiddlewareAPI {

    @GET
    @Path('filters')
    filters() : Promise<Array<string>>{
        return MiddlewareService.list('filter');
    }

    @GET
    @Path('interceptors/request')
    requestInterceptors() : Promise<Array<string>>{
        return MiddlewareService.list('interceptor/request');
    }

    @GET
    @Path('interceptors/response')
    responseInterceptors() : Promise<Array<string>>{
        return MiddlewareService.list('interceptor/response');
    }

    @GET
    @Path('authentication/strategies')
    authStrategies() : Promise<Array<string>>{
        return MiddlewareService.list('authentication/strategies');
    }

    @GET
    @Path('authentication/verify')
    authVerify() : Promise<Array<string>>{
        return MiddlewareService.list('authentication/verify');
    }

    @GET
    @Path('throttling/keyGenerators')
    throttlingKeyGenerator() : Promise<Array<string>>{
        return MiddlewareService.list('throttling/keyGenerator');
    }

    @GET
    @Path('throttling/handlers')
    throttlingHandler() : Promise<Array<string>>{
        return MiddlewareService.list('throttling/handler');
    }

    @GET
    @Path('throttling/skip')
    throttlingSkip() : Promise<Array<string>>{
        return MiddlewareService.list('throttling/skip');
    }

    @DELETE
    @Path('filters/:name')
    removeFilter(@PathParam("name")name: string) : Promise<void>{
        return MiddlewareService.remove('filter', name);
    }

    @DELETE
    @Path('interceptors/request/:name')
    removeRequestInterceptors(@PathParam("name")name: string) : Promise<void>{
        return MiddlewareService.remove('interceptor/request', name);
    }

    @DELETE
    @Path('interceptors/response/:name')
    removeResponseInterceptors(@PathParam("name")name: string) : Promise<void>{
        return MiddlewareService.remove('interceptor/response', name);
    }

    @DELETE
    @Path('authentication/strategies/:name')
    removeAuthStrategies(@PathParam("name")name: string) : Promise<void>{
        return MiddlewareService.remove('authentication/strategies', name);
    }

    @DELETE
    @Path('authentication/verify/:name')
    removeAuthVerify(@PathParam("name")name: string) : Promise<void>{
        return MiddlewareService.remove('authentication/verify', name);
    }

    @DELETE
    @Path('throttling/keyGenerators/:name')
    removeThrottlingKeyGenerator(@PathParam("name")name: string) : Promise<void>{
        return MiddlewareService.remove('throttling/keyGenerator', name);
    }

    @DELETE
    @Path('throttling/handlers/:name')
    removeThrottlingHandler(@PathParam("name")name: string) : Promise<void>{
        return MiddlewareService.remove('throttling/handler', name);
    }

    @DELETE
    @Path('throttling/skip/:name')
    removeThrottlingSkip(@PathParam("name")name: string) : Promise<void>{
        return MiddlewareService.remove('throttling/skip', name);
    }

    @PUT
    @Path('filters/:name')
    saveFilter(@PathParam("name")name: string, @FileParam("file") file: Express.Multer.File) : Promise<void>{
        return MiddlewareService.save(path.join('filter', name), file.buffer);
    }

    @PUT
    @Path('interceptors/request/:name')
    saveRequestInterceptors(@PathParam("name")name: string, @FileParam("file") file: Express.Multer.File) : Promise<void>{
        return MiddlewareService.save(path.join('interceptor/request', name), file.buffer);
    }

    @PUT
    @Path('interceptors/response/:name')
    saveResponseInterceptors(@PathParam("name")name: string, @FileParam("file") file: Express.Multer.File) : Promise<void>{
        return MiddlewareService.save(path.join('interceptor/response', name), file.buffer);
    }

    @PUT
    @Path('authentication/strategies/:name')
    saveAuthStrategies(@PathParam("name")name: string, @FileParam("file") file: Express.Multer.File) : Promise<void>{
        return MiddlewareService.save(path.join('authentication/strategies', name), file.buffer);
    }

    @PUT
    @Path('authentication/verify/:name')
    saveAuthVerify(@PathParam("name")name: string, @FileParam("file") file: Express.Multer.File) : Promise<void>{
        return MiddlewareService.save(path.join('authentication/verify', name), file.buffer);
    }

    @PUT
    @Path('throttling/keyGenerators/:name')
    saveThrottlingKeyGenerator(@PathParam("name")name: string, @FileParam("file") file: Express.Multer.File) : Promise<void>{
        return MiddlewareService.save(path.join('throttling/keyGenerator', name), file.buffer);
    }

    @PUT
    @Path('throttling/handlers/:name')
    saveThrottlingHandler(@PathParam("name")name: string, @FileParam("file") file: Express.Multer.File) : Promise<void>{
        return MiddlewareService.save(path.join('throttling/handler', name), file.buffer);
    }

    @PUT
    @Path('throttling/skip/:name')
    saveThrottlingSkip(@PathParam("name")name: string, @FileParam("file") file: Express.Multer.File) : Promise<void>{
        return MiddlewareService.save(path.join('throttling/skip', name), file.buffer);
    }
    @GET
    @Path('filters/:name')
    readFilter(@PathParam("name")name: string) : Promise<Return.DownloadResource>{
        return new Promise<Return.DownloadResource>((resolve, reject)=>{
            MiddlewareService.read('filter', name)
            .then(value=>{
                resolve(new Return.DownloadResource(value, name+'.js'));
            })
            .catch(err=>{
                reject(new Errors.NotFoundError());
            });
        });
    }

    @GET
    @Path('interceptors/request/:name')
    readRequestInterceptors(@PathParam("name")name: string) : Promise<Return.DownloadResource>{
        return new Promise<Return.DownloadResource>((resolve, reject)=>{
            MiddlewareService.read('interceptor/request', name)
            .then(value=>{
                resolve(new Return.DownloadResource(value, name+'.js'));
            })
            .catch(err=>{
                reject(new Errors.NotFoundError());
            });
        });
    }

    @GET
    @Path('interceptors/response/:name')
    readResponseInterceptors(@PathParam("name")name: string) : Promise<Return.DownloadResource>{
        return new Promise<Return.DownloadResource>((resolve, reject)=>{
            MiddlewareService.read('interceptor/response', name)
            .then(value=>{
                resolve(new Return.DownloadResource(value, name+'.js'));
            })
            .catch(err=>{
                reject(new Errors.NotFoundError());
            });
        });
    }

    @GET
    @Path('authentication/strategies/:name')
    readAuthStrategies(@PathParam("name")name: string): Promise<Return.DownloadResource>{
        return new Promise<Return.DownloadResource>((resolve, reject)=>{
            MiddlewareService.read('authentication/strategies', name)
            .then(value=>{
                resolve(new Return.DownloadResource(value, name+'.js'));
            })
            .catch(err=>{
                reject(new Errors.NotFoundError());
            });
        });
    }

    @GET
    @Path('authentication/verify/:name')
    readAuthVerify(@PathParam("name")name: string) : Promise<Return.DownloadResource>{
        return new Promise<Return.DownloadResource>((resolve, reject)=>{
            MiddlewareService.read('authentication/verify', name)
            .then(value=>{
                resolve(new Return.DownloadResource(value, name+'.js'));
            })
            .catch(err=>{
                reject(new Errors.NotFoundError());
            });
        });
    }

    @GET
    @Path('throttling/keyGenerators/:name')
    readThrottlingKeyGenerator(@PathParam("name")name: string): Promise<Return.DownloadResource>{
        return new Promise<Return.DownloadResource>((resolve, reject)=>{
            MiddlewareService.read('throttling/keyGenerator', name)
            .then(value=>{
                resolve(new Return.DownloadResource(value, name+'.js'));
            })
            .catch(err=>{
                reject(new Errors.NotFoundError());
            });
        });
    }

    @GET
    @Path('throttling/handlers/:name')
    readThrottlingHandler(@PathParam("name")name: string) : Promise<Return.DownloadResource>{
        return new Promise<Return.DownloadResource>((resolve, reject)=>{
            MiddlewareService.read('throttling/handler', name)
            .then(value=>{
                resolve(new Return.DownloadResource(value, name+'.js'));
            })
            .catch(err=>{
                reject(new Errors.NotFoundError());
            });
        });
    }
    
    @GET
    @Path('throttling/skip/:name')
    readThrottlingSkip(@PathParam("name")name: string) : Promise<Return.DownloadResource>{
        return new Promise<Return.DownloadResource>((resolve, reject)=>{
            MiddlewareService.read('throttling/skip', name)
            .then(value=>{
                resolve(new Return.DownloadResource(value, name+'.js'));
            })
            .catch(err=>{
                reject(new Errors.NotFoundError());
            });
        });
    }

    @POST
    @Path('filters')
    addFilter(@FileParam("file") file: Express.Multer.File, 
              @FormParam("name") name: string){
        return new Promise<Return.NewResource>((resolve, reject) =>{
            MiddlewareService.add(path.join('filter',name), file.buffer)
                .then(value=>{
                    resolve(new Return.NewResource(path.join('filter',name)));
                })
                .catch(err=>{
                    reject(new Errors.InternalServerError('Error saving filter.'))
                });
        });
    }

    @POST
    @Path('interceptors/request')
    addRequestInterceptors(@FileParam("file") file: Express.Multer.File, 
              @FormParam("name") name: string){
        return new Promise<Return.NewResource>((resolve, reject) =>{
            MiddlewareService.add(path.join('interceptor/request',name), file.buffer)
                .then(value=>{
                    resolve(new Return.NewResource(path.join('interceptors/request',name)));
                })
                .catch(err=>{
                    reject(new Errors.InternalServerError('Error saving interceptor.'))
                });
        });
    }

    @POST
    @Path('interceptors/response')
    addResponseInterceptors(@FileParam("file") file: Express.Multer.File, 
              @FormParam("name") name: string){
        return new Promise<Return.NewResource>((resolve, reject) =>{
            MiddlewareService.add(path.join('interceptor/response',name), file.buffer)
                .then(value=>{
                    resolve(new Return.NewResource(path.join('interceptors/response',name)));
                })
                .catch(err=>{
                    reject(new Errors.InternalServerError('Error saving interceptor.'))
                });
        });
    }

    @POST
    @Path('authentication/strategies')
    addAuthStrategy(@FileParam("file") file: Express.Multer.File, 
                    @FormParam("name") name: string){
        return new Promise<Return.NewResource>((resolve, reject) =>{
            MiddlewareService.add(path.join('authentication/strategies',name), file.buffer)
                .then(value=>{
                    resolve(new Return.NewResource(path.join('authentication/strategies',name)));
                })
                .catch(err=>{
                    reject(new Errors.InternalServerError('Error saving strategy.'))
                });
        });
    }

    @POST
    @Path('authentication/verify')
    addAuthVerify(@FileParam("file") file: Express.Multer.File, 
                    @FormParam("name") name: string){
        return new Promise<Return.NewResource>((resolve, reject) =>{
            MiddlewareService.add(path.join('authentication/verify',name), file.buffer)
                .then(value=>{
                    resolve(new Return.NewResource(path.join('authentication/verify',name)));
                })
                .catch(err=>{
                    reject(new Errors.InternalServerError('Error saving verify function.'))
                });
        });
    }

    @POST
    @Path('throttling/keyGenerators')
    addThrottlingKeyGenerator(@FileParam("file") file: Express.Multer.File, 
                    @FormParam("name") name: string){
        return new Promise<Return.NewResource>((resolve, reject) =>{
            MiddlewareService.add(path.join('throttling/keyGenerator',name), file.buffer)
                .then(value=>{
                    resolve(new Return.NewResource(path.join('throttling/keyGenerators',name)));
                })
                .catch(err=>{
                    reject(new Errors.InternalServerError('Error saving keyGenerator.'))
                });
        });
    }

    @POST
    @Path('throttling/handlers')
    addThrottlingHander(@FileParam("file") file: Express.Multer.File, 
                    @FormParam("name") name: string){
        return new Promise<Return.NewResource>((resolve, reject) =>{
            MiddlewareService.add(path.join('throttling/handler',name), file.buffer)
                .then(value=>{
                    resolve(new Return.NewResource(path.join('throttling/handlers',name)));
                })
                .catch(err=>{
                    reject(new Errors.InternalServerError('Error saving handler.'))
                });
        });
    }
    
    @POST
    @Path('throttling/skip')
    addThrottlingSkip(@FileParam("file") file: Express.Multer.File, 
                    @FormParam("name") name: string){
        return new Promise<Return.NewResource>((resolve, reject) =>{
            MiddlewareService.add(path.join('throttling/skip',name), file.buffer)
                .then(value=>{
                    resolve(new Return.NewResource(path.join('throttling/skip',name)));
                })
                .catch(err=>{
                    reject(new Errors.InternalServerError('Error saving handler.'))
                });
        });
    }
}