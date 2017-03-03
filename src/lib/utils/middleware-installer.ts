"use strict";

import {MiddlewareService} from "../service/middleware";
import * as fs from "fs-extra-promise";
import * as path from "path";
import {Logger} from "../logger";
import {AutoWired, Singleton, Provides, Inject} from "typescript-ioc";
import {Configuration} from "../configuration";

@AutoWired
@Singleton
export class MiddlewareInstaller {
    private types = ["filter", "interceptor/request", "interceptor/response",
                        "authentication/strategies", "authentication/verify",
                        "throttling/keyGenerator", "throttling/handler", 
                        "throttling/skip", "circuitbreaker/handler", "cors/origin"];

    @Inject private service:MiddlewareService;
    @Inject private logger: Logger;
    @Inject private config: Configuration;

    constructor() {
        if (process.env.processNumber) {
           this.registerClusterListener();
        }        
    }

    installAll(idMsg: string): Promise<void> {
        if (process.env.processNumber) {
            return new Promise<void>((resolve, reject) => {
                process.send({message: 'middleware.installAll', idMsg: idMsg});
                setTimeout(resolve, 1000); //We need to give time to child process receive the messages
            });
        }
        return this.doInstallAll();
    }

    install(type: string, name: string, idMsg: string): Promise<void> {
        if (process.env.processNumber) {
            return new Promise<void>((resolve, reject) => {
                process.send({
                    message: 'middleware.install', 
                    idMsg: idMsg,
                    type: type,
                    name: name
                });
                resolve();
            });
        }
        return this.doInstall(type, name);
    }

    uninstall(type: string, name: string, idMsg: string): Promise<void> {
        if (process.env.processNumber) {
            return new Promise<void>((resolve, reject) => {
                process.send({
                    message: 'middleware.uninstall', 
                    idMsg: idMsg,
                    type: type,
                    name: name
                });
                resolve();
            });
        }
        return this.doUninstall(type, name);
    }

    private registerClusterListener() {
        let cluster = require('cluster');
        cluster.worker.on('message', msg => {
            if (this.logger.isDebugEnabled()) {
                this.logger.debug(`Middleware update message received by worker ${process.env.processNumber}. MSG: ${JSON.stringify(msg)}`);
            }
            if (process.env.processNumber == msg.workerId) {
                switch(msg.message) {
                    case 'middleware.installAll': 
                        this.logger.info(`Process ${msg.workerId} is installing all middlewares.`);
                        return this.doInstallAll();
                    case 'middleware.install': 
                        this.logger.info(`Process ${msg.workerId} is installing a new middleware.`);
                        return this.doInstall(msg.type, msg.name);
                    case 'middleware.uninstall': 
                        this.logger.info(`Process ${msg.workerId} is uninstalling a middleware.`);
                        return this.doUninstall(msg.type, msg.name);
                }
            }
        });
    }

    private doInstallAll(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            Promise.all(this.types.map(type => this.installAllOfType(type)))
                .then(() => resolve())
                .catch(reject);
        });
    }

    private doInstall(type: string, name: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.doUninstall(type, name)
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

    private doUninstall(type: string, name: string): Promise<void> {
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
                    return Promise.all(names.map(name => this.doInstall(type, name)));
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