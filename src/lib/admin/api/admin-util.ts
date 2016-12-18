"use strict";

import {NotFoundError} from "../service/api";
import {Errors} from "typescript-rest";
import {AdminServer} from "../admin-server";

export abstract class RestController {
    private _service:any;

    get service() {
        if (!this._service) {
            this.init();
        }

        return this._service;
    }

    private init() {
        if (AdminServer.gateway.redisClient) {
            this._service = new this.redisServiceClass(AdminServer.gateway.redisClient);
        } else {
            this._service = new this.fileServiceClass(AdminServer.gateway.middlewarePath);
        }
    }

    abstract get redisServiceClass();

    abstract get fileServiceClass();

    handleError(err: Error) {
        if (err instanceof NotFoundError) {
            return new Errors.NotFoundError();
        } else if(err instanceof Errors.ForbidenError) {
            return err;
        } else {
            return new Errors.InternalServerError(err.message);
        }
    }
}