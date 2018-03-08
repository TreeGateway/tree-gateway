'use strict';

import * as _ from 'lodash';
import * as fs from 'fs-extra-promise';
import * as path from 'path';
import * as request from 'request';
import { GatewayConfig } from '../../config/gateway';
import { getSwaggerHost } from '../../utils/config';

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
    getCircuitBreakerMiddleware(name: string): Promise<Buffer>;
    getCorsMiddleware(name: string): Promise<Buffer>;
    getProxyRouterMiddleware(name: string): Promise<Buffer>;
    getServiceDiscoveryMiddleware(name: string): Promise<Buffer>;
    getServiceDiscoveryProviderMiddleware(name: string): Promise<Buffer>;
    getErrorHandlerMiddleware(name: string): Promise<Buffer>;
    getRequestLoggerMiddleware(name: string): Promise<Buffer>;
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
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestFilters({ name });
        return this.getResponseBody(response);
    }

    async requestInterceptors(name?: string): Promise<Array<string>> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestRequestInterceptors({ name });
        return this.getResponseBody(response);
    }

    async responseInterceptors(name?: string): Promise<Array<string>> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestResponseInterceptors({ name });
        return this.getResponseBody(response);
    }

    async authStrategies(name?: string): Promise<Array<string>> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestAuthStrategies({ name });
        return this.getResponseBody(response);
    }

    async authVerify(name?: string): Promise<Array<string>> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestAuthVerify({ name });
        return this.getResponseBody(response);
    }

    async throttlingKeyGenerator(name?: string): Promise<Array<string>> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestThrottlingKeyGenerator({ name });
        return this.getResponseBody(response);
    }

    async throttlingHandler(name?: string): Promise<Array<string>> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestThrottlingHandler({ name });
        return this.getResponseBody(response);
    }

    async throttlingSkip(name?: string): Promise<Array<string>> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestThrottlingSkip({ name });
        return this.getResponseBody(response);
    }

    async circuitBreaker(name?: string): Promise<Array<string>> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestCircuitBreaker({ name });
        return this.getResponseBody(response);
    }

    async corsOrigin(name?: string): Promise<Array<string>> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestCorsOrigin({ name });
        return this.getResponseBody(response);
    }

    async proxyRouter(name?: string): Promise<Array<string>> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestProxyRouter({ name });
        return this.getResponseBody(response);
    }

    async serviceDiscovery(name?: string): Promise<Array<string>> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestServiceDiscovery({ name });
        return this.getResponseBody(response);
    }

    async serviceDiscoveryProvider(name?: string): Promise<Array<string>> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestServiceDiscoveryProvider({ name });
        return this.getResponseBody(response);
    }

    async errorHandler(name?: string): Promise<Array<string>> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestErrorHandler({ name });
        return this.getResponseBody(response);
    }

    async requestLogger(name?: string): Promise<Array<string>> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestRequestLogger({ name });
        return this.getResponseBody(response);
    }

    async removeFilter(name: string): Promise<void> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestRemoveFilter({ name });
        if (response.status !== 204) {
            throw new Error(response.text);
        }
    }

    async removeRequestInterceptor(name: string): Promise<void> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestRemoveRequestInterceptor({ name });
        if (response.status !== 204) {
            throw new Error(response.text);
        }
    }

    async removeResponseInterceptor(name: string): Promise<void> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestRemoveResponseInterceptor({ name });
        if (response.status !== 204) {
            throw new Error(response.text);
        }
    }

    async removeAuthStrategy(name: string): Promise<void> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestRemoveAuthStrategy({ name });
        if (response.status !== 204) {
            throw new Error(response.text);
        }
    }

    async removeAuthVerify(name: string): Promise<void> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestRemoveAuthVerify({ name });
        if (response.status !== 204) {
            throw new Error(response.text);
        }
    }

    async removeThrottlingKeyGenerator(name: string): Promise<void> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestRemoveThrottlingKeyGenerator({ name });
        if (response.status !== 204) {
            throw new Error(response.text);
        }
    }

    async removeThrottlingHandler(name: string): Promise<void> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestRemoveThrottlingHandler({ name });
        if (response.status !== 204) {
            throw new Error(response.text);
        }
    }

    async removeThrottlingSkip(name: string): Promise<void> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestRemoveThrottlingSkip({ name });
        if (response.status !== 204) {
            throw new Error(response.text);
        }
    }

    async removeCircuitBreaker(name: string): Promise<void> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestRemoveCircuitBreaker({ name });
        if (response.status !== 204) {
            throw new Error(response.text);
        }
    }

    async removeCors(name: string): Promise<void> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestRemoveCors({ name });
        if (response.status !== 204) {
            throw new Error(response.text);
        }
    }

    async removeProxyRouter(name: string): Promise<void> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestRemoveProxyRouter({ name });
        if (response.status !== 204) {
            throw new Error(response.text);
        }
    }

    async removeServiceDiscovery(name: string): Promise<void> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestRemoveServiceDiscovery({ name });
        if (response.status !== 204) {
            throw new Error(response.text);
        }
    }

    async removeServiceDiscoveryProvider(name: string): Promise<void> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestRemoveServiceDiscoveryProvider({ name });
        if (response.status !== 204) {
            throw new Error(response.text);
        }
    }

    async removeErrorHandler(name: string): Promise<void> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestRemoveErrorHandler({ name });
        if (response.status !== 204) {
            throw new Error(response.text);
        }
    }

    async removeRequestLogger(name: string): Promise<void> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestRemoveRequestLogger({ name });
        if (response.status !== 204) {
            throw new Error(response.text);
        }
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
        return this.installMiddleware('cors/origin', fileName, true);
    }

    updateProxyRouter(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('proxy/router', fileName, true);
    }

    updateServiceDiscovery(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('servicediscovery', fileName, true);
    }

    updateServiceDiscoveryProvider(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('servicediscovery/provider', fileName, true);
    }

    updateErrorHandler(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('errorhandler', fileName, true);
    }

    updateRequestLogger(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('request/logger', fileName, true);
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

    addThrottlingHandler(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('throttling/handlers', fileName);
    }

    addThrottlingSkip(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('throttling/skip', fileName);
    }

    addCircuitBreaker(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('circuitbreaker', fileName);
    }

    addCors(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('cors/origin', fileName);
    }

    addProxyRouter(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('proxy/router', fileName);
    }

    addServiceDiscovery(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('servicediscovery', fileName);
    }

    addServiceDiscoveryProvider(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('servicediscovery/provider', fileName);
    }

    addErrorHandler(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('errorhandler', fileName);
    }

    addRequestLogger(name: string, fileName: string): Promise<void> {
        return this.installMiddleware('request/logger', fileName);
    }

    async getFilter(name: string): Promise<Buffer> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestGetFilter({ name });
        return this.getResponseBody(response);
    }

    async getRequestInterceptor(name: string): Promise<Buffer> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestGetRequestInterceptor({ name });
        return this.getResponseBody(response);
    }

    async getResponseInterceptor(name: string): Promise<Buffer> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestGetResponseInterceptor({ name });
        return this.getResponseBody(response);
    }

    async getAuthStrategy(name: string): Promise<Buffer> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestGetAuthStrategy({ name });
        return this.getResponseBody(response);
    }

    async getAuthVerify(name: string): Promise<Buffer> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestGetAuthVerify({ name });
        return this.getResponseBody(response);
    }

    async getThrottlingKeyGenerator(name: string): Promise<Buffer> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestGetThrottlingKeyGenerator({ name });
        return this.getResponseBody(response);
    }

    async getThrottlingHandler(name: string): Promise<Buffer> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestGetThrottlingHandler({ name });
        return this.getResponseBody(response);
    }

    async getThrottlingSkip(name: string): Promise<Buffer> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestGetThrottlingSkip({ name });
        return this.getResponseBody(response);
    }

    async getCircuitBreakerMiddleware(name: string): Promise<Buffer> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestGetCircuitBreakerMiddleware({ name });
        return this.getResponseBody(response);
    }

    async getCorsMiddleware(name: string): Promise<Buffer> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestGetCorsMiddleware({ name });
        return this.getResponseBody(response);
    }

    async getProxyRouterMiddleware(name: string): Promise<Buffer> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestGetProxyRouterMiddleware({ name });
        return this.getResponseBody(response);
    }

    async getServiceDiscoveryMiddleware(name: string): Promise<Buffer> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestGetServiceDiscoveryMiddleware({ name });
        return this.getResponseBody(response);
    }

    async getServiceDiscoveryProviderMiddleware(name: string): Promise<Buffer> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestGetServiceDiscoveryProviderMiddleware({ name });
        return this.getResponseBody(response);
    }

    async getErrorHandlerMiddleware(name: string): Promise<Buffer> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestGetErrorHandlerMiddleware({ name });
        return this.getResponseBody(response);
    }

    async getRequestLoggerMiddleware(name: string): Promise<Buffer> {
        const response = await this.swaggerClient.apis.Middleware.MiddlewareRestGetRequestLoggerMiddleware({ name });
        return this.getResponseBody(response);
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
            form.append('name', fileName.replace('.js', ''));
            form.append('file', <any>stream, fileName);
        });
    }

    private getResponseBody(response: any) {
        if (response.status !== 200) {
            throw new Error(response.text);
        }
        return response.body;
    }
}
