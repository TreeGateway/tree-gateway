'use strict';

import { Inject } from 'typescript-ioc';
import { DELETE, GET, Path, PathParam, POST, PUT, QueryParam, Return } from 'typescript-rest';
import * as swagger from 'typescript-rest-swagger';
import { ApiConfig, validateApiConfig } from '../../config/api';
import { Configuration } from '../../configuration';
import { ApiService } from '../../service/api';

@Path('apis')
@swagger.Tags('APIs')
@swagger.Security('Bearer')
export class APIRest {
    @Inject private service: ApiService;
    @Inject private config: Configuration;

    @GET
    public list(@QueryParam('name') name?: string,
        @QueryParam('version') version?: string,
        @QueryParam('description') description?: string,
        @QueryParam('path') path?: string): Promise<Array<ApiConfig>> {
        return this.service.list(name, version, description, path);
    }

    @POST
    public async addApi(api: ApiConfig): Promise<Return.NewResource<void>> {
        await validateApiConfig(api, this.config.gateway.disableApiIdValidation);
        const apiId = await this.service.create(api);
        return (new Return.NewResource<void>(`apis/${apiId}`));
    }

    @PUT
    @Path('/:id')
    public async updateApi(@PathParam('id') id: string, api: ApiConfig): Promise<void> {
        api.id = id;

        await validateApiConfig(api, this.config.gateway.disableApiIdValidation);
        await this.service.update(api);
    }

    @DELETE
    @Path('/:id')
    public async removeApi(@PathParam('id') id: string): Promise<void> {
        await this.service.remove(id);
    }

    @GET
    @Path('/:id')
    public async getApi(@PathParam('id') id: string): Promise<ApiConfig> {
        return await this.service.get(id);
    }
}
