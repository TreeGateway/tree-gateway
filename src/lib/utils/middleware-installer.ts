import {MiddlewareService, RedisMiddlewareService} from "../service/middleware";
import * as fs from "fs-extra";
//import * as _ from "lodash";
import * as path from "path";
import {Logger} from "../logger";

export class MiddlewareInstaller {
    private types = ["filter", "interceptor/request", "interceptor/response",
                        "authentication/strategies", "authentication/verify",
                        "throttling/keyGenerator", "throttling/handler", "throttling/skip"];

    private service:MiddlewareService;
    private middlewarePath:string;
    private logger: Logger;

    constructor(redisClient, middlewarePath:string, logger: Logger) {
        this.service = new RedisMiddlewareService(redisClient);
        this.middlewarePath = middlewarePath;
        this.logger = logger;
    }

    installAll(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            Promise.all(this.types.map(type => this.installAllOfType(type)))
                .then(() => resolve())
                .catch(reject);
        });
    }

    installAllOfType(type: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.service.list(type)
                .then((names) => {
                    return Promise.all(names.map(name => this.install(type, name)));
                })
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

            fs.remove(this.getPath(type, name), (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    private saveFile(filePath: string, content: Buffer): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            // TODO: support zip files
            fs.outputFile(filePath + '.js', content, (err) => {
                if (err) {
                    reject(err);
                } else{
                    resolve();
                }
            });
        });
    }

    private getPath(type: string, name:string):string {
        return path.join(this.middlewarePath, type, name);
    }
}