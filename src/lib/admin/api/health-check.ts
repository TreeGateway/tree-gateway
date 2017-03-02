"use strict";

import {Path, GET, POST, DELETE, PUT, PathParam, FileParam, FormParam, Errors, Return,
        Accept} from "typescript-rest";
import "es6-promise";
import * as path from "path";
import {AutoWired, Inject} from "typescript-ioc";
import {Database} from "../../database";

@Path('healthcheck')
@AutoWired
export class HealthCheck {
    @Inject private database: Database;

    @GET
    check(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.database.redisClient.ping().then(() => {
                resolve("OK");
            })
            .catch(err => {
                reject(new Errors.InternalServerError());
            });
        });
    }
}