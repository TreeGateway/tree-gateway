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
    async set(config: ConfigPackage): Promise<void> {
        await validateConfigPackage(config);
        await this.service.set(config);
    }

    @GET
    async get(): Promise<ConfigPackage> {
        return await this.service.get();
    }
}
