'use strict';

import * as _ from 'lodash';
import * as fs from 'fs-extra-promise';
import * as path from 'path';
import * as request from 'request';

export interface Middleware {
    filters(name?: string): Promise<Array<string>>;
    requestInterceptors(name?: string): Promise<Array<string>>;
    responseInterceptors(name?: string): Promise<Array<string>>;
    authStrategies(name?: string): Promise<Array<string>>;
    authVerify(name?: string): Promise<Array<string>>;
    throttlingKeyGenerator(name?: string): Promise<Array<string>>;
    throttlingHandler(name?: string): Promise<Array<string>>;
    throttlingSkip(name?: string): Promise<Array<string>>;
    circuitBreaker(name?: string): Promise<Array<string>>;
    corsOrigin(name?: string): Promise<Array<string>>;
    removeFilter(name: string): Promise<void>;
    removeRequestInterceptor( name: string): Promise<void>;
    removeResponseInterceptor( name: string): Promise<void>;
    removeAuthStrategy( name: string): Promise<void>;
    removeAuthVerify( name: string): Promise<void>;
    removeThrottlingKeyGenerator( name: string): Promise<void>;
    removeThrottlingHandler( name: string): Promise<void>;
    removeThrottlingSkip( name: string): Promise<void>;
    removeCircuitBreaker( name: string): Promise<void>;
    removeCors(name: string): Promise<void>;
    updateFilter(name: string, fileName: string): Promise<void>;
    updateRequestInterceptor(name: string, fileName: string): Promise<void>;
    updateResponseInterceptor(name: string, fileName: string): Promise<void>;
    updateAuthStrategy(name: string, fileName: string): Promise<void>;
    updateAuthVerify(name: string, fileName: string): Promise<void>;
    updateThrottlingKeyGenerator(name: string, fileName: string): Promise<void>;
    updateThrottlingHandler(name: string, fileName: string): Promise<void>;
    updateThrottlingSkip(name: string, fileName: string): Promise<void>;
    updateCircuitBreaker(name: string, fileName: string): Promise<void>;
    updateCors(name: string, fileName: string): Promise<void>;
    addFilter(name: string, fileName: string): Promise<void>;
    addRequestInterceptor(name: string, fileName: string): Promise<void>;
    addResponseInterceptor(name: string, fileName: string): Promise<void>;
    addAuthStrategy(name: string, fileName: string): Promise<void>;
    addAuthVerify(name: string, fileName: string): Promise<void>;
    addThrottlingKeyGenerator(name: string, fileName: string): Promise<void>;
    addThrottlingHander(name: string, fileName: string): Promise<void>;
    addThrottlingSkip(name: string, fileName: string): Promise<void>;
    addCircuitBreaker(name: string, fileName: string): Promise<void>;
    addCors(name: string, fileName: string): Promise<void>;
    getFilter(name: string): Promise<Buffer>;
    getRequestInterceptor(name: string): Promise<Buffer>;
    getResponseInterceptor(name: string): Promise<Buffer>;
    getAuthStrategy(name: string): Promise<Buffer>;
    getAuthVerify(name: string): Promise<Buffer>;
    getThrottlingKeyGenerator(name: string): Promise<Buffer>;
    getThrottlingHandler(name: string): Promise<Buffer>;
    getThrottlingSkip(name: string): Promise<Buffer>;
    getCircuitBreakerMiddleware(name: string): Promise<Buffer>;
    getCorsMiddleware(name: string): Promise<Buffer>;
}

export class MiddlewareClient implements Middleware {
    private swaggerClient: any;
    private authToken: string;
    private middlewareRequest: any;

    constructor(swaggerClient: any, authToken: string) {
        this.swaggerClient = swaggerClient;
        this.authToken = authToken;
        if (!this.swaggerClient.spec || !this.swaggerClient.spec.schemes ||
            !this.swaggerClient.spec.schemes.length || !this.swaggerClient.spec.host) {
            throw new Error('Invalid swagger specification. Can not found the target endpoint to call.');
        }
        this.middlewareRequest = request.defaults({baseUrl: `${this.swaggerClient.spec.schemes[0]}://${this.swaggerClient.spec.host}`});

    }

    filters(name?: string): Promise<Array<string>> {
        return new Promise<Array<string>>((resolve, reject) => {
            this.swaggerClient.apis.Middleware.MiddlewareRestFilters({name})
                .then((response: any) => {
                    if (response.status === 200) {
                        return resolve(response.body);
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    requestInterceptors(name?: string): Promise<Array<string>> {
        return new Promise<Array<string>>((resolve, reject) => {
            this.swaggerClient.apis.Middleware.MiddlewareRestRequestInterceptors({name})
                .then((response: any) => {
                    if (response.status === 200) {
                        return resolve(response.body);
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    responseInterceptors(name?: string): Promise<Array<string>> {
        return new Promise<Array<string>>((resolve, reject) => {
            this.swaggerClient.apis.Middleware.MiddlewareRestResponseInterceptors({name})
                .then((response: any) => {
                    if (response.status === 200) {
                        return resolve(response.body);
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    authStrategies(name?: string): Promise<Array<string>> {
        return new Promise<Array<string>>((resolve, reject) => {
            this.swaggerClient.apis.Middleware.MiddlewareRestAuthStrategies({name})
                .then((response: any) => {
                    if (response.status === 200) {
                        return resolve(response.body);
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    authVerify(name?: string): Promise<Array<string>> {
        return new Promise<Array<string>>((resolve, reject) => {
            this.swaggerClient.apis.Middleware.MiddlewareRestAuthVerify({name})
                .then((response: any) => {
                    if (response.status === 200) {
                        return resolve(response.body);
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    throttlingKeyGenerator(name?: string): Promise<Array<string>> {
        return new Promise<Array<string>>((resolve, reject) => {
            this.swaggerClient.apis.Middleware.MiddlewareRestThrottlingKeyGenerator({name})
                .then((response: any) => {
                    if (response.status === 200) {
                        return resolve(response.body);
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    throttlingHandler(name?: string): Promise<Array<string>> {
        return new Promise<Array<string>>((resolve, reject) => {
            this.swaggerClient.apis.Middleware.MiddlewareRestThrottlingHandler({name})
                .then((response: any) => {
                    if (response.status === 200) {
                        return resolve(response.body);
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    throttlingSkip(name?: string): Promise<Array<string>> {
        return new Promise<Array<string>>((resolve, reject) => {
            this.swaggerClient.apis.Middleware.MiddlewareRestThrottlingSkip({name})
                .then((response: any) => {
                    if (response.status === 200) {
                        return resolve(response.body);
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    circuitBreaker(name?: string): Promise<Array<string>> {
        return new Promise<Array<string>>((resolve, reject) => {
            this.swaggerClient.apis.Middleware.MiddlewareRestCircuitBreaker({name})
                .then((response: any) => {
                    if (response.status === 200) {
                        return resolve(response.body);
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    corsOrigin(name?: string): Promise<Array<string>> {
        return new Promise<Array<string>>((resolve, reject) => {
            this.swaggerClient.apis.Middleware.MiddlewareRestCorsOrigin({name})
                .then((response: any) => {
                    if (response.status === 200) {
                        return resolve(response.body);
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    removeFilter(name: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.swaggerClient.apis.Middleware.MiddlewareRestRemoveFilter({name})
                .then((response: any) => {
                    if (response.status === 204) {
                        return resolve();
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    removeRequestInterceptor(name: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.swaggerClient.apis.Middleware.MiddlewareRestRemoveRequestInterceptor({name})
                .then((response: any) => {
                    if (response.status === 204) {
                        return resolve();
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    removeResponseInterceptor(name: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.swaggerClient.apis.Middleware.MiddlewareRestRemoveResponseInterceptor({name})
                .then((response: any) => {
                    if (response.status === 204) {
                        return resolve();
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    removeAuthStrategy(name: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.swaggerClient.apis.Middleware.MiddlewareRestRemoveAuthStrategy({name})
                .then((response: any) => {
                    if (response.status === 204) {
                        return resolve();
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    removeAuthVerify(name: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.swaggerClient.apis.Middleware.MiddlewareRestRemoveAuthVerify({name})
                .then((response: any) => {
                    if (response.status === 204) {
                        return resolve();
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    removeThrottlingKeyGenerator(name: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.swaggerClient.apis.Middleware.MiddlewareRestRemoveThrottlingKeyGenerator({name})
                .then((response: any) => {
                    if (response.status === 204) {
                        return resolve();
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    removeThrottlingHandler(name: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.swaggerClient.apis.Middleware.MiddlewareRestRemoveThrottlingHandler({name})
                .then((response: any) => {
                    if (response.status === 204) {
                        return resolve();
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    removeThrottlingSkip(name: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.swaggerClient.apis.Middleware.MiddlewareRestRemoveThrottlingSkip({name})
                .then((response: any) => {
                    if (response.status === 204) {
                        return resolve();
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    removeCircuitBreaker(name: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.swaggerClient.apis.Middleware.MiddlewareRestRemoveCircuitBreaker({name})
                .then((response: any) => {
                    if (response.status === 204) {
                        return resolve();
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    removeCors(name: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.swaggerClient.apis.Middleware.MiddlewareRestRemoveCors({name})
                .then((response: any) => {
                    if (response.status === 204) {
                        return resolve();
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    updateFilter(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('filters', fileName, true);
    }

    updateRequestInterceptor(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('interceptors/request', fileName, true);
    }

    updateResponseInterceptor(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('interceptors/response', fileName, true);
    }

    updateAuthStrategy(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('authentication/strategies', fileName, true);
    }

    updateAuthVerify(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('authentication/verify', fileName, true);
    }

    updateThrottlingKeyGenerator(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('throttling/keyGenerators', fileName, true);
    }

    updateThrottlingHandler(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('throttling/handlers', fileName, true);
    }

    updateThrottlingSkip(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('throttling/skip', fileName, true);
    }

    updateCircuitBreaker(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('circuitbreaker', fileName, true);
    }

    updateCors(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('cors', fileName, true);
    }

    addFilter(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('filters', fileName);
    }

    addRequestInterceptor(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('interceptors/request', fileName);
    }

    addResponseInterceptor(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('interceptors/response', fileName);
    }

    addAuthStrategy(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('authentication/strategies', fileName);
    }

    addAuthVerify(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('authentication/verify', fileName);
    }

    addThrottlingKeyGenerator(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('throttling/keyGenerators', fileName);
    }

    addThrottlingHander(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('throttling/handlers', fileName);
    }

    addThrottlingSkip(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('throttling/skip', fileName);
    }

    addCircuitBreaker(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('circuitbreaker', fileName);
    }

    addCors(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('cors', fileName);
    }

    getFilter(name: string): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            this.swaggerClient.apis.Middleware.MiddlewareRestGetFilter({name})
                .then((response: any) => {
                    if (response.status === 200) {
                        return resolve(response.body);
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    getRequestInterceptor(name: string): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            this.swaggerClient.apis.Middleware.MiddlewareRestGetRequestInterceptor({name})
                .then((response: any) => {
                    if (response.status === 200) {
                        return resolve(response.body);
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    getResponseInterceptor(name: string): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            this.swaggerClient.apis.Middleware.MiddlewareRestGetResponseInterceptor({name})
                .then((response: any) => {
                    if (response.status === 200) {
                        return resolve(response.body);
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    getAuthStrategy(name: string): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            this.swaggerClient.apis.Middleware.MiddlewareRestGetAuthStrategy({name})
                .then((response: any) => {
                    if (response.status === 200) {
                        return resolve(response.body);
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    getAuthVerify(name: string): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            this.swaggerClient.apis.Middleware.MiddlewareRestGetAuthVerify({name})
                .then((response: any) => {
                    if (response.status === 200) {
                        return resolve(response.body);
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    getThrottlingKeyGenerator(name: string): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            this.swaggerClient.apis.Middleware.MiddlewareRestGetThrottlingKeyGenerator({name})
                .then((response: any) => {
                    if (response.status === 200) {
                        return resolve(response.body);
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    getThrottlingHandler(name: string): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            this.swaggerClient.apis.Middleware.MiddlewareRestGetThrottlingHandler({name})
                .then((response: any) => {
                    if (response.status === 200) {
                        return resolve(response.body);
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    getThrottlingSkip(name: string): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            this.swaggerClient.apis.Middleware.MiddlewareRestGetThrottlingSkip({name})
                .then((response: any) => {
                    if (response.status === 200) {
                        return resolve(response.body);
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    getCircuitBreakerMiddleware(name: string): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            this.swaggerClient.apis.Middleware.MiddlewareRestGetCircuitBreakerMiddleware({name})
                .then((response: any) => {
                    if (response.status === 200) {
                        return resolve(response.body);
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    getCorsMiddleware(name: string): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            this.swaggerClient.apis.Middleware.MiddlewareRestGetCorsMiddleware({name})
                .then((response: any) => {
                    if (response.status === 200) {
                        return resolve(response.body);
                    }
                    reject(response.text);
                })
                .catch(reject);
        });
    }

    private getStream(fileName: string) {
        if (_.startsWith(fileName, '.')) {
            fileName = path.join(process.cwd(), fileName);
        }
        return fs.createReadStream(fileName);
    }

    private installMiddleware(servicePath: string, filePath: string, update?: boolean): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const stream = this.getStream(filePath);
            const fileName = filePath.substring(filePath.lastIndexOf('/')+1);
            const req = this.middlewareRequest.post('/middleware/'+servicePath, {
                headers: { 'authorization': `JWT ${this.authToken}` }
            }, (error: any, response: any, body: any) => {
                if (error) {
                    return reject(error);
                }
                if (response.statusCode === 201) {
                    return resolve();
                }
                return reject(`Status code: ${response.statusCode}`);
            });
            const form: FormData = req.form();
            form.append('name', fileName.replace('.js', ''));
            form.append('file', <any>stream, fileName);
        });
    }
}
