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
    async check(): Promise<string> {
        try {
            await this.database.redisClient.ping();
            return 'OK';
        } catch (err) {
            throw new Errors.InternalServerError();
        }
    }
}
