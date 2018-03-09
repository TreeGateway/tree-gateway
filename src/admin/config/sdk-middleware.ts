'use strict';

import * as _ from 'lodash';
import * as fs from 'fs-extra-promise';
import * as path from 'path';
import * as request from 'request';
import { GatewayConfig } from '../../config/gateway';
import { getSwaggerHost } from '../../utils/config';
import { getResponseBody, checkStatus, invoke } from './utils';

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

    constructor(swaggerClient: any, authToken: string, gateway: GatewayConfig) {
        this.swaggerClient = swaggerClient;
        this.authToken = authToken;
        if (!this.swaggerClient.spec || !this.swaggerClient.spec.host) {
            this.swaggerClient.spec.host = getSwaggerHost(gateway);
        }
        if (!this.swaggerClient.spec || !this.swaggerClient.spec.schemes ||
            !this.swaggerClient.spec.schemes.length || !this.swaggerClient.spec.host) {
            throw new Error('Invalid swagger specification. Can not found the target endpoint to call.');
        }
        this.middlewareRequest = request.defaults({ baseUrl: `${this.swaggerClient.spec.schemes[0]}://${this.swaggerClient.spec.host}` });

    }

    async filters(name?: string): Promise<Array<string>> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestFilters({ name }));
        return getResponseBody(response);
    }

    async requestInterceptors(name?: string): Promise<Array<string>> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestRequestInterceptors({ name }));
        return getResponseBody(response);
    }

    async responseInterceptors(name?: string): Promise<Array<string>> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestResponseInterceptors({ name }));
        return getResponseBody(response);
    }

    async authStrategies(name?: string): Promise<Array<string>> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestAuthStrategies({ name }));
        return getResponseBody(response);
    }

    async authVerify(name?: string): Promise<Array<string>> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestAuthVerify({ name }));
        return getResponseBody(response);
    }

    async throttlingKeyGenerator(name?: string): Promise<Array<string>> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestThrottlingKeyGenerator({ name }));
        return getResponseBody(response);
    }

    async throttlingHandler(name?: string): Promise<Array<string>> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestThrottlingHandler({ name }));
        return getResponseBody(response);
    }

    async throttlingSkip(name?: string): Promise<Array<string>> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestThrottlingSkip({ name }));
        return getResponseBody(response);
    }

    async circuitBreaker(name?: string): Promise<Array<string>> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestCircuitBreaker({ name }));
        return getResponseBody(response);
    }

    async corsOrigin(name?: string): Promise<Array<string>> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestCorsOrigin({ name }));
        return getResponseBody(response);
    }

    async proxyRouter(name?: string): Promise<Array<string>> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestProxyRouter({ name }));
        return getResponseBody(response);
    }

    async serviceDiscovery(name?: string): Promise<Array<string>> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestServiceDiscovery({ name }));
        return getResponseBody(response);
    }

    async serviceDiscoveryProvider(name?: string): Promise<Array<string>> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestServiceDiscoveryProvider({ name }));
        return getResponseBody(response);
    }

    async errorHandler(name?: string): Promise<Array<string>> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestErrorHandler({ name }));
        return getResponseBody(response);
    }

    async requestLogger(name?: string): Promise<Array<string>> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestRequestLogger({ name }));
        return getResponseBody(response);
    }

    async removeFilter(name: string): Promise<void> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestRemoveFilter({ name }));
        checkStatus(response, 204);
    }

    async removeRequestInterceptor(name: string): Promise<void> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestRemoveRequestInterceptor({ name }));
        checkStatus(response, 204);
    }

    async removeResponseInterceptor(name: string): Promise<void> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestRemoveResponseInterceptor({ name }));
        checkStatus(response, 204);
    }

    async removeAuthStrategy(name: string): Promise<void> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestRemoveAuthStrategy({ name }));
        checkStatus(response, 204);
    }

    async removeAuthVerify(name: string): Promise<void> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestRemoveAuthVerify({ name }));
        checkStatus(response, 204);
    }

    async removeThrottlingKeyGenerator(name: string): Promise<void> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestRemoveThrottlingKeyGenerator({ name }));
        checkStatus(response, 204);
    }

    async removeThrottlingHandler(name: string): Promise<void> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestRemoveThrottlingHandler({ name }));
        checkStatus(response, 204);
    }

    async removeThrottlingSkip(name: string): Promise<void> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestRemoveThrottlingSkip({ name }));
        checkStatus(response, 204);
    }

    async removeCircuitBreaker(name: string): Promise<void> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestRemoveCircuitBreaker({ name }));
        checkStatus(response, 204);
    }

    async removeCors(name: string): Promise<void> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestRemoveCors({ name }));
        checkStatus(response, 204);
    }

    async removeProxyRouter(name: string): Promise<void> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestRemoveProxyRouter({ name }));
        checkStatus(response, 204);
    }

    async removeServiceDiscovery(name: string): Promise<void> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestRemoveServiceDiscovery({ name }));
        checkStatus(response, 204);
    }

    async removeServiceDiscoveryProvider(name: string): Promise<void> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestRemoveServiceDiscoveryProvider({ name }));
        checkStatus(response, 204);
    }

    async removeErrorHandler(name: string): Promise<void> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestRemoveErrorHandler({ name }));
        checkStatus(response, 204);
    }

    async removeRequestLogger(name: string): Promise<void> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestRemoveRequestLogger({ name }));
        checkStatus(response, 204);
    }

    updateFilter(name: string, fileName: string): Promise<void> {
        return this.updateMiddleware('filters', fileName, name);
    }

    updateRequestInterceptor(name: string, fileName: string): Promise<void> {
        return this.updateMiddleware('interceptors/request', fileName, name);
    }

    updateResponseInterceptor(name: string, fileName: string): Promise<void> {
        return this.updateMiddleware('interceptors/response', fileName, name);
    }

    updateAuthStrategy(name: string, fileName: string): Promise<void> {
        return this.updateMiddleware('authentication/strategies', fileName, name);
    }

    updateAuthVerify(name: string, fileName: string): Promise<void> {
        return this.updateMiddleware('authentication/verify', fileName, name);
    }

    updateThrottlingKeyGenerator(name: string, fileName: string): Promise<void> {
        return this.updateMiddleware('throttling/keyGenerators', fileName, name);
    }

    updateThrottlingHandler(name: string, fileName: string): Promise<void> {
        return this.updateMiddleware('throttling/handlers', fileName, name);
    }

    updateThrottlingSkip(name: string, fileName: string): Promise<void> {
        return this.updateMiddleware('throttling/skip', fileName, name);
    }

    updateCircuitBreaker(name: string, fileName: string): Promise<void> {
        return this.updateMiddleware('circuitbreaker', fileName, name);
    }

    updateCors(name: string, fileName: string): Promise<void> {
        return this.updateMiddleware('cors/origin', fileName, name);
    }

    updateProxyRouter(name: string, fileName: string): Promise<void> {
        return this.updateMiddleware('proxy/router', fileName, name);
    }

    updateServiceDiscovery(name: string, fileName: string): Promise<void> {
        return this.updateMiddleware('servicediscovery', fileName, name);
    }

    updateServiceDiscoveryProvider(name: string, fileName: string): Promise<void> {
        return this.updateMiddleware('servicediscovery/provider', fileName, name);
    }

    updateErrorHandler(name: string, fileName: string): Promise<void> {
        return this.updateMiddleware('errorhandler', fileName, name);
    }

    updateRequestLogger(name: string, fileName: string): Promise<void> {
        return this.updateMiddleware('request/logger', fileName, name);
    }

    addFilter(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('filters', fileName, name);
    }

    addRequestInterceptor(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('interceptors/request', fileName, name);
    }

    addResponseInterceptor(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('interceptors/response', fileName, name);
    }

    addAuthStrategy(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('authentication/strategies', fileName, name);
    }

    addAuthVerify(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('authentication/verify', fileName, name);
    }

    addThrottlingKeyGenerator(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('throttling/keyGenerators', fileName, name);
    }

    addThrottlingHandler(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('throttling/handlers', fileName, name);
    }

    addThrottlingSkip(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('throttling/skip', fileName, name);
    }

    addCircuitBreaker(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('circuitbreaker', fileName, name);
    }

    addCors(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('cors/origin', fileName, name);
    }

    addProxyRouter(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('proxy/router', fileName, name);
    }

    addServiceDiscovery(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('servicediscovery', fileName, name);
    }

    addServiceDiscoveryProvider(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('servicediscovery/provider', fileName, name);
    }

    addErrorHandler(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('errorhandler', fileName, name);
    }

    addRequestLogger(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('request/logger', fileName, name);
    }

    async getFilter(name: string): Promise<Buffer> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestGetFilter({ name }));
        return getResponseBody(response);
    }

    async getRequestInterceptor(name: string): Promise<Buffer> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestGetRequestInterceptor({ name }));
        return getResponseBody(response);
    }

    async getResponseInterceptor(name: string): Promise<Buffer> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestGetResponseInterceptor({ name }));
        return getResponseBody(response);
    }

    async getAuthStrategy(name: string): Promise<Buffer> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestGetAuthStrategy({ name }));
        return getResponseBody(response);
    }

    async getAuthVerify(name: string): Promise<Buffer> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestGetAuthVerify({ name }));
        return getResponseBody(response);
    }

    async getThrottlingKeyGenerator(name: string): Promise<Buffer> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestGetThrottlingKeyGenerator({ name }));
        return getResponseBody(response);
    }

    async getThrottlingHandler(name: string): Promise<Buffer> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestGetThrottlingHandler({ name }));
        return getResponseBody(response);
    }

    async getThrottlingSkip(name: string): Promise<Buffer> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestGetThrottlingSkip({ name }));
        return getResponseBody(response);
    }

    async getCircuitBreaker(name: string): Promise<Buffer> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestGetCircuitBreakerMiddleware({ name }));
        return getResponseBody(response);
    }

    async getCors(name: string): Promise<Buffer> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestGetCorsMiddleware({ name }));
        return getResponseBody(response);
    }

    async getProxyRouter(name: string): Promise<Buffer> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestGetProxyRouterMiddleware({ name }));
        return getResponseBody(response);
    }

    async getServiceDiscovery(name: string): Promise<Buffer> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestGetServiceDiscoveryMiddleware({ name }));
        return getResponseBody(response);
    }

    async getServiceDiscoveryProvider(name: string): Promise<Buffer> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestGetServiceDiscoveryProviderMiddleware({ name }));
        return getResponseBody(response);
    }

    async getErrorHandler(name: string): Promise<Buffer> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestGetErrorHandlerMiddleware({ name }));
        return getResponseBody(response);
    }

    async getRequestLogger(name: string): Promise<Buffer> {
        const response = await invoke(this.swaggerClient.apis.Middleware.MiddlewareRestGetRequestLoggerMiddleware({ name }));
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
            form.append('file', <any>stream, fileName);
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
            form.append('file', <any>stream, fileName);
        });
    }
}
