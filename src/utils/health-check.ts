'use strict';

import { EventEmitter } from 'events';
import * as http from 'http';
import * as https from 'https';
import * as _ from 'lodash';
import { Inject } from 'typescript-ioc';
import * as url from 'url';
import { Logger } from '../logger';
import { getMilisecondsInterval } from './time-intervals';

export interface HealthCheckOptions {
    checkInterval?: string | number;
    failCount?: number;
    servers: Array<string>;
    waitTimeout?: string | number;
}

export interface CheckServer {
    down: boolean;
    failCount: number;
    lastStatus: string;
}

export class HealthCheck extends EventEmitter {
    @Inject private logger: Logger;

    private checks: any = {};
    private previousChecks: any;
    private options: HealthCheckOptions;
    private interval: number;
    private checking: boolean = false;

    constructor(options: HealthCheckOptions) {
        super();
        this.options = _.defaults(options, {
            checkInterval: 30000,
            failCount: 2,
            waitTimeout: 2000
        });

        if (options && options.servers && options.servers.length > 0) {
            options.servers.forEach((s) => {
                this.checks[s] = {
                    down: false,
                    failCount: 0,
                    lastStatus: ''
                };
            });
            this.start();
        }
    }

    public start() {
        if (!this.interval) {
            this.check();
            this.interval = setInterval(() => {
                this.check();
            }, getMilisecondsInterval(this.options.checkInterval, 30000));
        }
    }

    public stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = 0;
        }
    }

    public isDown(serverUrl: string) {
        const hc = this.checks[serverUrl];
        if (hc) {
            return hc.down;
        } else {
            return new Error(`healthcheck: Unknow server: ${name}`);
        }
    }

    public status() {
        return Object.assign({}, this.checks);
    }

    private check() {
        if (!this.checking) {
            this.checking = true;
            this.previousChecks = this.status();
            const promises = new Array<Promise<CheckServer>>();
            _.forIn(this.checks, (config, urlServer) => {
                promises.push(this.checkServer(urlServer, config));
            });

            Promise.all(promises)
                .then((result) => {
                    this.checking = false;
                    if (!_.isEqual(this.previousChecks, this.checks)) {
                        if (this.logger.isDebugEnabled()) {
                            this.logger.debug(`Health state changed: ${JSON.stringify(this.checks)}`);
                        }
                        this.emit('change', this.status());
                    }
                }).catch(err => {
                    this.checking = false;
                });
        }
    }

    private checkServer(urlServer: string, config: CheckServer) {
        return new Promise<CheckServer>((resolve, reject) => {
            if (this.logger.isDebugEnabled()) {
                this.logger.debug(`Checking server health: ${urlServer}`);
            }

            const urlCheck = url.parse(urlServer);
            let ended = false;

            const library: any = urlCheck.protocol === 'https' ? https : http;
            const request: any = library.get({
                agent: false,
                host: urlCheck.hostname,
                path: urlCheck.pathname,
                port: urlCheck.port
            }, (response: http.ClientResponse) => {
                let result = new Buffer('');
                if (response.statusCode === 200) {
                    response.on('data', (chunk: Buffer) => {
                        result = Buffer.concat([result, chunk]);
                    });
                    response.on('end', () => {
                        if (ended) {
                            return null;
                        }
                        config.lastStatus = 'OK';
                        config.failCount = 0;
                        config.down = false;
                        resolve(config);
                    });
                } else {
                    config.lastStatus = 'Non 200 HTTP status code';
                    config.failCount += 1;
                    if (config.failCount >= this.options.failCount) {
                        config.down = true;
                        resolve(config);
                    }
                }
            });

            request.on('socket', (socket: any) => {
                socket.setTimeout(getMilisecondsInterval(this.options.waitTimeout, 2000));
                socket.on('timeout', () => {
                    ended = true;
                    request.abort();
                    config.lastStatus = 'Healthcheck timed out';
                    config.failCount += 1;
                    if (config.failCount >= this.options.failCount) {
                        config.down = true;
                    }
                    resolve(config);
                });
            });

            request.on('error', (error: any) => {
                ended = true;
                config.lastStatus = error.message;
                config.failCount += 1;
                if (config.failCount >= this.options.failCount) {
                    config.down = true;
                }
                resolve(config);
            });
        });
    }
}
