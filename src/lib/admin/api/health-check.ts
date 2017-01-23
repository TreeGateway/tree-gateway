"use strict";

import {Path, GET, POST, DELETE, PUT, PathParam, FileParam, FormParam, Errors, Return,
        Accept} from "typescript-rest";
import "es6-promise";
import * as path from "path";
import {AdminServer} from "../admin-server";
import {MiddlewareService, RedisMiddlewareService} from "../../service/middleware";

@Path('healthcheck')
export class HealthCheck {
    @GET
    check(): Promise<string> {
        return new Promise((resolve, reject) => {
            AdminServer.gateway.redisClient.ping().then(() => {
                resolve("OK");
            })
            .catch(err => {
                reject(new Errors.InternalServerError());
            });
        });
    }
}