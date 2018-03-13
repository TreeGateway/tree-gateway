'use strict';

export class SdkError extends Error {
    private statusCode: number;
    constructor(message: string, code: number) {
        super(message);
        this.statusCode = code;
        Object.setPrototypeOf(this, SdkError.prototype);
    }

    get code(): number {
        return this.statusCode;
    }
}
