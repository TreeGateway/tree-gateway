'use strict';

import { Path, GET, POST } from 'typescript-rest';
import { ConfigPackage, validateConfigPackage } from '../../config/config-package';
import { ConfigPackageService } from '../../service/config-package';
import { Inject } from 'typescript-ioc';
import * as swagger from 'typescript-rest-swagger';

@Path('config')
@swagger.Tags('Config')
@swagger.Security('Bearer')
export class ConfigPackageRest {
    @Inject private service: ConfigPackageService;

    @POST
    set(config: ConfigPackage): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            validateConfigPackage(config)
                .then(() => this.service.set(config))
                .then(resolve)
                .catch(reject);
        });
    }

    @GET
    get(): Promise<ConfigPackage> {
        return new Promise((resolve, reject) => {
            this.service.get()
                .then(resolve)
                .catch(reject);
        });
    }
}
