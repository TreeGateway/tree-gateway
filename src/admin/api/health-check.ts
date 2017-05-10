'use strict';

import { Path, GET, Errors } from 'typescript-rest';
import { AutoWired, Inject } from 'typescript-ioc';
import { Database } from '../../database';

@Path('healthcheck')
@AutoWired
export class HealthCheck {
    @Inject private database: Database;

    @GET
    check(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.database.redisClient.ping().then(() => {
                resolve('OK');
            })
                .catch((err: any) => {
                    reject(new Errors.InternalServerError());
                });
        });
    }
}
