'use strict';

import { Inject } from 'typescript-ioc';
import { Errors, GET, Path } from 'typescript-rest';
import * as swagger from 'typescript-rest-swagger';
import { Database } from '../../database';

@Path('healthcheck')
@swagger.Tags('Miscellaneous')
export class HealthCheck {
    @Inject private database: Database;

    @GET
    public async check(): Promise<string> {
        try {
            await this.database.redisClient.ping();
            return 'OK';
        } catch (err) {
            throw new Errors.InternalServerError();
        }
    }
}
