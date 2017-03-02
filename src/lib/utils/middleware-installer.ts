"use strict";

import {MiddlewareService} from "../service/middleware";
import * as fs from "fs-extra-promise";
import * as path from "path";
import {Logger} from "../logger";
import {AutoWired, Provides, Inject} from "typescript-ioc";
import {Configuration} from "../configuration";

@AutoWired
export class MiddlewareInstaller {
    private types = ["filter", "interceptor/request", "interceptor/response",
                        "authentication/strategies", "authentication/verify",
                        "throttling/keyGenerator", "throttling/handler", 
                        "throttling/skip", "circuitbreaker/handler", "cors/origin"];

    @Inject private service:MiddlewareService;
    @Inject private logger: Logger;
    @Inject private config: Configuration;

    installAll(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            Promise.all(this.types.map(type => this.installAllOfType(type)))
                .then(() => resolve())
                .catch(reject);
        });
    }

    install(type: string, name: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.uninstall(type, name)
                .then(() => {
                    if (this.logger.isDebugEnabled()) {
                        this.logger.debug(`Installing middleware ${type}/${name}`);
                    }
                    return this.service.read(type, name);
                })
                .then((content) => {
                    return this.saveFile(this.getPath(type, name), content);
                })
                .then(() => {
                    if (this.logger.isDebugEnabled()) {
                        this.logger.debug(`Middleware ${type}/${name} installed.`);
                    }

                    resolve();
                })
                .catch(reject);
        });
    }

    uninstall(type: string, name: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.logger.isDebugEnabled()) {
                this.logger.debug(`Uninstalling middleware ${type}/${name}`);
            }
            const p = this.getPath(type, name);
            if (fs.existsSync(p)) {
                fs.removeAsync(p)
                    .then(resolve)
                    .catch(reject);
            }
            else {
                resolve();
            }
        });
    }

    private installAllOfType(type: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.service.list(type)
                .then((names) => {
                    return Promise.all(names.map(name => this.install(type, name)));
                })
                .then(() => resolve())
                .catch(reject);
        });
    }

    private saveFile(filePath: string, content: Buffer): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            // TODO: support zip files
            fs.outputFileAsync(filePath, content)
                .then(resolve)
                .catch(reject);
        });
    }

    private getPath(type: string, name:string):string {
        return path.join(this.config.gateway.middlewarePath, type, name + ".js");
    }
}