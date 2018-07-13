'use strict';

import { Errors, HttpError } from 'typescript-rest';

export class UnauthorizedError extends Errors.UnauthorizedError {
    constructor(message?: string) {
        super(message);

        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
}

export class NotFoundError extends Errors.NotFoundError {
    constructor(message?: string) {
        super(message);

        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

export class UnavailableError extends Error {
    public statusCode: number = 503;
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, UnavailableError.prototype);
    }
}

export class ProxyError extends HttpError {
    constructor(message: string, statusCode: number) {
        super('gatewayError', statusCode, message);
        Object.setPrototypeOf(this, ProxyError.prototype);
    }
}
