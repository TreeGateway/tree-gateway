'use strict';

import { Inject } from 'typescript-ioc';
import { GET, Path, POST } from 'typescript-rest';
import * as swagger from 'typescript-rest-swagger';
import { ConfigPackage, validateConfigPackage } from '../../config/config-package';
import { ConfigPackageService } from '../../service/config-package';

@Path('config')
@swagger.Tags('Config')
@swagger.Security('Bearer')
export class ConfigPackageRest {
    @Inject private service: ConfigPackageService;

    @POST
    public async set(config: ConfigPackage): Promise<void> {
        await validateConfigPackage(config);
        await this.service.set(config);
    }

    @GET
    public async get(): Promise<ConfigPackage> {
        return await this.service.get();
    }
}
