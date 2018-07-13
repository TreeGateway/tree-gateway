'use strict';

import * as fs from 'fs-extra-promise';
import * as _ from 'lodash';
import * as path from 'path';
import * as request from 'request';
import { checkStatus, getResponseBody, invoke } from './utils';

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
    proxyRouter(name?: string): Promise<Array<string>>;
    serviceDiscovery(name?: string): Promise<Array<string>>;
    serviceDiscoveryProvider(name?: string): Promise<Array<string>>;
    errorHandler(name?: string): Promise<Array<string>>;
    requestLogger(name?: string): Promise<Array<string>>;
    removeFilter(name: string): Promise<void>;
    removeRequestInterceptor(name: string): Promise<void>;
    removeResponseInterceptor(name: string): Promise<void>;
    removeAuthStrategy(name: string): Promise<void>;
    removeAuthVerify(name: string): Promise<void>;
    removeThrottlingKeyGenerator(name: string): Promise<void>;
    removeThrottlingHandler(name: string): Promise<void>;
    removeThrottlingSkip(name: string): Promise<void>;
    removeCircuitBreaker(name: string): Promise<void>;
    removeCors(name: string): Promise<void>;
    removeProxyRouter(name: string): Promise<void>;
    removeServiceDiscovery(name: string): Promise<void>;
    removeServiceDiscoveryProvider(name: string): Promise<void>;
    removeErrorHandler(name: string): Promise<void>;
    removeRequestLogger(name: string): Promise<void>;
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
    updateProxyRouter(name: string, fileName: string): Promise<void>;
    updateServiceDiscovery(name: string, fileName: string): Promise<void>;
    updateServiceDiscoveryProvider(name: string, fileName: string): Promise<void>;
    updateErrorHandler(name: string, fileName: string): Promise<void>;
    updateRequestLogger(name: string, fileName: string): Promise<void>;
    addFilter(name: string, fileName: string): Promise<void>;
    addRequestInterceptor(name: string, fileName: string): Promise<void>;
    addResponseInterceptor(name: string, fileName: string): Promise<void>;
    addAuthStrategy(name: string, fileName: string): Promise<void>;
    addAuthVerify(name: string, fileName: string): Promise<void>;
    addThrottlingKeyGenerator(name: string, fileName: string): Promise<void>;
    addThrottlingHandler(name: string, fileName: string): Promise<void>;
    addThrottlingSkip(name: string, fileName: string): Promise<void>;
    addCircuitBreaker(name: string, fileName: string): Promise<void>;
    addCors(name: string, fileName: string): Promise<void>;
    addProxyRouter(name: string, fileName: string): Promise<void>;
    addServiceDiscovery(name: string, fileName: string): Promise<void>;
    addServiceDiscoveryProvider(name: string, fileName: string): Promise<void>;
    addErrorHandler(name: string, fileName: string): Promise<void>;
    addRequestLogger(name: string, fileName: string): Promise<void>;
    getFilter(name: string): Promise<Buffer>;
    getRequestInterceptor(name: string): Promise<Buffer>;
    getResponseInterceptor(name: string): Promise<Buffer>;
    getAuthStrategy(name: string): Promise<Buffer>;
    getAuthVerify(name: string): Promise<Buffer>;
    getThrottlingKeyGenerator(name: string): Promise<Buffer>;
    getThrottlingHandler(name: string): Promise<Buffer>;
    getThrottlingSkip(name: string): Promise<Buffer>;
    getCircuitBreaker(name: string): Promise<Buffer>;
    getCors(name: string): Promise<Buffer>;
    getProxyRouter(name: string): Promise<Buffer>;
    getServiceDiscovery(name: string): Promise<Buffer>;
    getServiceDiscoveryProvider(name: string): Promise<Buffer>;
    getErrorHandler(name: string): Promise<Buffer>;
    getRequestLogger(name: string): Promise<Buffer>;
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
        this.middlewareRequest = request.defaults({ baseUrl: `${this.swaggerClient.spec.schemes[0]}://${this.swaggerClient.spec.host}` });

    }

    public async filters(name?: string): Promise<Array<string>> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestFilters({ name: name }));
        return getResponseBody(response);
    }

    public async requestInterceptors(name?: string): Promise<Array<string>> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestRequestInterceptors({ name: name }));
        return getResponseBody(response);
    }

    public async responseInterceptors(name?: string): Promise<Array<string>> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestResponseInterceptors({ name: name }));
        return getResponseBody(response);
    }

    public async authStrategies(name?: string): Promise<Array<string>> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestAuthStrategies({ name: name }));
        return getResponseBody(response);
    }

    public async authVerify(name?: string): Promise<Array<string>> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestAuthVerify({ name: name }));
        return getResponseBody(response);
    }

    public async throttlingKeyGenerator(name?: string): Promise<Array<string>> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestThrottlingKeyGenerator({ name: name }));
        return getResponseBody(response);
    }

    public async throttlingHandler(name?: string): Promise<Array<string>> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestThrottlingHandler({ name: name }));
        return getResponseBody(response);
    }

    public async throttlingSkip(name?: string): Promise<Array<string>> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestThrottlingSkip({ name: name }));
        return getResponseBody(response);
    }

    public async circuitBreaker(name?: string): Promise<Array<string>> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestCircuitBreaker({ name: name }));
        return getResponseBody(response);
    }

    public async corsOrigin(name?: string): Promise<Array<string>> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestCorsOrigin({ name: name }));
        return getResponseBody(response);
    }

    public async proxyRouter(name?: string): Promise<Array<string>> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestProxyRouter({ name: name }));
        return getResponseBody(response);
    }

    public async serviceDiscovery(name?: string): Promise<Array<string>> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestServiceDiscovery({ name: name }));
        return getResponseBody(response);
    }

    public async serviceDiscoveryProvider(name?: string): Promise<Array<string>> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestServiceDiscoveryProvider({ name: name }));
        return getResponseBody(response);
    }

    public async errorHandler(name?: string): Promise<Array<string>> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestErrorHandler({ name: name }));
        return getResponseBody(response);
    }

    public async requestLogger(name?: string): Promise<Array<string>> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestRequestLogger({ name: name }));
        return getResponseBody(response);
    }

    public async removeFilter(name: string): Promise<void> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestRemoveFilter({ name: name }));
        checkStatus(response, 204);
    }

    public async removeRequestInterceptor(name: string): Promise<void> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestRemoveRequestInterceptor({ name: name }));
        checkStatus(response, 204);
    }

    public async removeResponseInterceptor(name: string): Promise<void> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestRemoveResponseInterceptor({ name: name }));
        checkStatus(response, 204);
    }

    public async removeAuthStrategy(name: string): Promise<void> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestRemoveAuthStrategy({ name: name }));
        checkStatus(response, 204);
    }

    public async removeAuthVerify(name: string): Promise<void> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestRemoveAuthVerify({ name: name }));
        checkStatus(response, 204);
    }

    public async removeThrottlingKeyGenerator(name: string): Promise<void> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestRemoveThrottlingKeyGenerator({ name: name }));
        checkStatus(response, 204);
    }

    public async removeThrottlingHandler(name: string): Promise<void> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestRemoveThrottlingHandler({ name: name }));
        checkStatus(response, 204);
    }

    public async removeThrottlingSkip(name: string): Promise<void> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestRemoveThrottlingSkip({ name: name }));
        checkStatus(response, 204);
    }

    public async removeCircuitBreaker(name: string): Promise<void> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestRemoveCircuitBreaker({ name: name }));
        checkStatus(response, 204);
    }

    public async removeCors(name: string): Promise<void> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestRemoveCors({ name: name }));
        checkStatus(response, 204);
    }

    public async removeProxyRouter(name: string): Promise<void> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestRemoveProxyRouter({ name: name }));
        checkStatus(response, 204);
    }

    public async removeServiceDiscovery(name: string): Promise<void> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestRemoveServiceDiscovery({ name: name }));
        checkStatus(response, 204);
    }

    public async removeServiceDiscoveryProvider(name: string): Promise<void> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestRemoveServiceDiscoveryProvider({ name: name }));
        checkStatus(response, 204);
    }

    public async removeErrorHandler(name: string): Promise<void> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestRemoveErrorHandler({ name: name }));
        checkStatus(response, 204);
    }

    public async removeRequestLogger(name: string): Promise<void> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestRemoveRequestLogger({ name: name }));
        checkStatus(response, 204);
    }

    public updateFilter(name: string, fileName: string): Promise<void> {
        return this.updateMiddleware('filters', fileName, name);
    }

    public updateRequestInterceptor(name: string, fileName: string): Promise<void> {
        return this.updateMiddleware('interceptors/request', fileName, name);
    }

    public updateResponseInterceptor(name: string, fileName: string): Promise<void> {
        return this.updateMiddleware('interceptors/response', fileName, name);
    }

    public updateAuthStrategy(name: string, fileName: string): Promise<void> {
        return this.updateMiddleware('authentication/strategies', fileName, name);
    }

    public updateAuthVerify(name: string, fileName: string): Promise<void> {
        return this.updateMiddleware('authentication/verify', fileName, name);
    }

    public updateThrottlingKeyGenerator(name: string, fileName: string): Promise<void> {
        return this.updateMiddleware('throttling/keyGenerators', fileName, name);
    }

    public updateThrottlingHandler(name: string, fileName: string): Promise<void> {
        return this.updateMiddleware('throttling/handlers', fileName, name);
    }

    public updateThrottlingSkip(name: string, fileName: string): Promise<void> {
        return this.updateMiddleware('throttling/skip', fileName, name);
    }

    public updateCircuitBreaker(name: string, fileName: string): Promise<void> {
        return this.updateMiddleware('circuitbreaker', fileName, name);
    }

    public updateCors(name: string, fileName: string): Promise<void> {
        return this.updateMiddleware('cors/origin', fileName, name);
    }

    public updateProxyRouter(name: string, fileName: string): Promise<void> {
        return this.updateMiddleware('proxy/router', fileName, name);
    }

    public updateServiceDiscovery(name: string, fileName: string): Promise<void> {
        return this.updateMiddleware('servicediscovery', fileName, name);
    }

    public updateServiceDiscoveryProvider(name: string, fileName: string): Promise<void> {
        return this.updateMiddleware('servicediscovery/provider', fileName, name);
    }

    public updateErrorHandler(name: string, fileName: string): Promise<void> {
        return this.updateMiddleware('errorhandler', fileName, name);
    }

    public updateRequestLogger(name: string, fileName: string): Promise<void> {
        return this.updateMiddleware('request/logger', fileName, name);
    }

    public addFilter(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('filters', fileName, name);
    }

    public addRequestInterceptor(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('interceptors/request', fileName, name);
    }

    public addResponseInterceptor(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('interceptors/response', fileName, name);
    }

    public addAuthStrategy(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('authentication/strategies', fileName, name);
    }

    public addAuthVerify(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('authentication/verify', fileName, name);
    }

    public addThrottlingKeyGenerator(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('throttling/keyGenerators', fileName, name);
    }

    public addThrottlingHandler(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('throttling/handlers', fileName, name);
    }

    public addThrottlingSkip(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('throttling/skip', fileName, name);
    }

    public addCircuitBreaker(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('circuitbreaker', fileName, name);
    }

    public addCors(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('cors/origin', fileName, name);
    }

    public addProxyRouter(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('proxy/router', fileName, name);
    }

    public addServiceDiscovery(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('servicediscovery', fileName, name);
    }

    public addServiceDiscoveryProvider(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('servicediscovery/provider', fileName, name);
    }

    public addErrorHandler(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('errorhandler', fileName, name);
    }

    public addRequestLogger(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('request/logger', fileName, name);
    }

    public async getFilter(name: string): Promise<Buffer> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestGetFilter({ name: name }));
        return getResponseBody(response);
    }

    public async getRequestInterceptor(name: string): Promise<Buffer> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestGetRequestInterceptor({ name: name }));
        return getResponseBody(response);
    }

    public async getResponseInterceptor(name: string): Promise<Buffer> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestGetResponseInterceptor({ name: name }));
        return getResponseBody(response);
    }

    public async getAuthStrategy(name: string): Promise<Buffer> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestGetAuthStrategy({ name: name }));
        return getResponseBody(response);
    }

    public async getAuthVerify(name: string): Promise<Buffer> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestGetAuthVerify({ name: name }));
        return getResponseBody(response);
    }

    public async getThrottlingKeyGenerator(name: string): Promise<Buffer> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestGetThrottlingKeyGenerator({ name: name }));
        return getResponseBody(response);
    }

    public async getThrottlingHandler(name: string): Promise<Buffer> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestGetThrottlingHandler({ name: name }));
        return getResponseBody(response);
    }

    public async getThrottlingSkip(name: string): Promise<Buffer> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestGetThrottlingSkip({ name: name }));
        return getResponseBody(response);
    }

    public async getCircuitBreaker(name: string): Promise<Buffer> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestGetCircuitBreakerMiddleware({ name: name }));
        return getResponseBody(response);
    }

    public async getCors(name: string): Promise<Buffer> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestGetCorsMiddleware({ name: name }));
        return getResponseBody(response);
    }

    public async getProxyRouter(name: string): Promise<Buffer> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestGetProxyRouterMiddleware({ name: name }));
        return getResponseBody(response);
    }

    public async getServiceDiscovery(name: string): Promise<Buffer> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestGetServiceDiscoveryMiddleware({ name: name }));
        return getResponseBody(response);
    }

    public async getServiceDiscoveryProvider(name: string): Promise<Buffer> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestGetServiceDiscoveryProviderMiddleware({ name: name }));
        return getResponseBody(response);
    }

    public async getErrorHandler(name: string): Promise<Buffer> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestGetErrorHandlerMiddleware({ name: name }));
        return getResponseBody(response);
    }

    public async getRequestLogger(name: string): Promise<Buffer> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestGetRequestLoggerMiddleware({ name: name }));
        return getResponseBody(response);
    }

    private getStream(fileName: string) {
        if (_.startsWith(fileName, '.')) {
            fileName = path.join(process.cwd(), fileName);
        }
        return fs.createReadStream(fileName);
    }

    private installMiddleware(servicePath: string, filePath: string, name: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const stream = this.getStream(filePath);
            const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
            const req = this.middlewareRequest.post('/middleware/' + servicePath, {
                headers: { 'authorization': `Bearer ${this.authToken}` }
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
            form.append('name', name);
            form.append('file', stream as any, fileName);
        });
    }

    private updateMiddleware(servicePath: string, filePath: string, name: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const stream = this.getStream(filePath);
            const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
            const req = this.middlewareRequest.put(`/middleware/${servicePath}/${name}`, {
                headers: { 'authorization': `Bearer ${this.authToken}` }
            }, (error: any, response: any, body: any) => {
                if (error) {
                    return reject(error);
                }
                if (response.statusCode === 204) {
                    return resolve();
                }
                return reject(`Status code: ${response.statusCode}`);
            });
            const form: FormData = req.form();
            form.append('file', stream as any, fileName);
        });
    }
}
