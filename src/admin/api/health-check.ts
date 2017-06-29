'use strict';

import { Path, GET, Errors } from 'typescript-rest';
import { Inject } from 'typescript-ioc';
import { Database } from '../../database';
import * as swagger from 'typescript-rest-swagger';

@Path('healthcheck')
@swagger.Tags('Miscellaneous')
export class HealthCheck {
    @Inject private database: Database;

    @GET
    check(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.database.redisClient.ping()
                .then(() => {
                    resolve('OK');
                })
                .catch((err: any) => {
                    reject(new Errors.InternalServerError());
                });
        });
    }
}
