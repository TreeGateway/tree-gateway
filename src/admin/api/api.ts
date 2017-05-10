'use strict';

import { Path, GET, POST, DELETE, PUT, PathParam, Errors, Return } from 'typescript-rest';
import { ApiConfig, validateApiConfig } from '../../config/api';
import { ApiService } from '../../service/api';
import { Inject } from 'typescript-ioc';
import { Tags } from 'typescript-rest-swagger';

@Path('apis')
@Tags('APIs administration')
export class APIRest {
    @Inject private service: ApiService;

    @GET
    list(): Promise<Array<ApiConfig>> {
        return this.service.list();
    }

    @POST
    addApi(api: ApiConfig): Promise<Return.NewResource<void>> {
        return new Promise<Return.NewResource<void>>((resolve, reject) => {
            validateApiConfig(api)
                .catch(err => {
                    throw new Errors.ForbidenError(JSON.stringify(err));
                })
                .then(() => this.service.create(api))
                .then((apiId) => resolve(new Return.NewResource<void>(`apis/${apiId}`)))
                .catch(reject);
        });
    }

    @PUT
    @Path('/:id')
    updateApi( @PathParam('id') id: string, api: ApiConfig): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            api.id = id;

            validateApiConfig(api)
                .catch(err => {
                    throw new Errors.ForbidenError(JSON.stringify(err));
                })
                .then(() => this.service.update(api))
                .then(() => resolve())
                .catch(reject);
        });
    }

    @DELETE
    @Path('/:id')
    deleteApi( @PathParam('id') id: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.service.remove(id)
                .then(() => resolve())
                .catch(reject);
        });
    }

    @GET
    @Path('/:id')
    getApi( @PathParam('id') id: string): Promise<ApiConfig> {
        return new Promise((resolve, reject) => {
            this.service.get(id)
                .then(resolve)
                .catch(reject);
        });
    }
}
