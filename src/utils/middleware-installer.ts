'use strict';

import * as fs from 'fs-extra-promise';
import * as path from 'path';
import { AutoWired, Inject, Singleton } from 'typescript-ioc';
import { Configuration } from '../configuration';
import { Logger } from '../logger';
import { MiddlewareService } from '../service/middleware';

const decache = require('decache');

@AutoWired
@Singleton
export class MiddlewareInstaller {
    private types = ['filter', 'interceptor/request', 'interceptor/response',
        'authentication/strategy', 'authentication/verify',
        'throttling/keyGenerator', 'throttling/handler',
        'throttling/skip', 'circuitbreaker', 'cors/origin', 'proxy/router',
        'servicediscovery', 'servicediscovery/provider', 'errorhandler', 'request/logger'];

    @Inject private service: MiddlewareService;
    @Inject private logger: Logger;
    @Inject private config: Configuration;

    public async installAll(): Promise<void> {
        await Promise.all(this.types.map(type => this.installAllOfType(type)));
    }

    public async install(type: string, name: string): Promise<void> {
        await this.uninstall(type, name);
        if (this.logger.isDebugEnabled()) {
            this.logger.debug(`Installing middleware ${type}/${name}`);
        }
        const content = await this.service.read(type, name);
        await this.saveFile(this.getPath(type, name), content);
        if (this.logger.isDebugEnabled()) {
            this.logger.debug(`Middleware ${type}/${name} installed.`);
        }
    }

    public async uninstall(type: string, name: string): Promise<void> {
        if (this.logger.isDebugEnabled()) {
            this.logger.debug(`Uninstalling middleware ${type}/${name}`);
        }
        const p = this.getPath(type, name);
        if (fs.existsSync(p)) {
            this.removeModuleCache(type, name);
            await fs.removeAsync(p);
        }
    }

    public removeModuleCache(type: string, name: string) {
        decache(this.getModuleName(type, name));
    }

    private async installAllOfType(type: string): Promise<void> {
        const names = await this.service.list(type);
        await Promise.all(names.map((name: string) => this.install(type, name)));
    }

    private async saveFile(filePath: string, content: Buffer): Promise<void> {
        // TODO: support zip files
        await fs.outputFileAsync(filePath, content);
    }

    private getPath(type: string, name: string): string {
        return this.getModuleName(type, name) + '.js';
    }

    private getModuleName(type: string, name: string): string {
        return path.join(this.config.middlewarePath, type, name);
    }
}
