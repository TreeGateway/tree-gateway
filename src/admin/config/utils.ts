'use strict';

import { SdkError } from '../../error/errors';

export function checkStatus(response: any, status: number) {
    if (response.status !== status) {
        throw new Error(response.text);
    }
}

export function getResponseBody(response: any) {
    checkStatus(response, 200);
    return response.body;
}

export function getCreatedResource(response: any) {
    checkStatus(response, 201);
    return response.headers['location'];
}

export async function invoke(promise: Promise<any>) {
    try {
        return await promise;
    } catch (err) {
        if (err.response && err.response.body) {
            throw new SdkError(err.response.body.error, err.response.body.code);
        }
        throw new SdkError(err.message, 500);
    }
}
