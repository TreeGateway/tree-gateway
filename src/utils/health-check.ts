'use strict';

import * as http from 'http';
import * as https from 'https';
import * as url from 'url';
import * as _ from 'lodash';
import { EventEmitter } from 'events';
import { getMilisecondsInterval } from './time-intervals';
import { Logger } from '../logger';
import { Inject } from 'typescript-ioc';

export interface HealthCheckOptions {
    delay?: string | number;
    failcount?: number;
    servers: Array<string>;
    timeout?: string | number;
}

export interface CheckServer {
    down: boolean;
    failcount: number;
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
            delay: 30000,
            failcount: 2,
            timeout: 2000
        });

        if (options && options.servers && options.servers.length > 0) {
            options.servers.forEach((s) => {
                this.checks[s] = {
                    down: false,
                    failcount: 0,
                    lastStatus: ''
                };
            });
            this.start();
        }
    }

    start() {
        if (!this.interval) {
            this.check();
            this.interval = setInterval(() => {
                this.check();
            }, getMilisecondsInterval(this.options.delay, 30000));
        }
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = 0;
        }
    }

    isDown(serverUrl: string) {
        const hc = this.checks[serverUrl];
        if (hc) {
            return hc.down;
        } else {
            return new Error(`healthcheck: Unknow server: ${name}`);
        }
    }

    status() {
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
                        config.failcount = 0;
                        config.down = false;
                        resolve(config);
                    });
                } else {
                    config.lastStatus = 'Non 200 HTTP status code';
                    config.failcount += 1;
                    if (config.failcount >= this.options.failcount) {
                        config.down = true;
                        resolve(config);
                    }
                }
            });

            request.on('socket', (socket: any) => {
                socket.setTimeout(getMilisecondsInterval(this.options.timeout, 2000));
                socket.on('timeout', () => {
                    ended = true;
                    request.abort();
                    config.lastStatus = 'Healthcheck timed out';
                    config.failcount += 1;
                    if (config.failcount >= this.options.failcount) {
                        config.down = true;
                    }
                    resolve(config);
                });
            });

            request.on('error', (error: any) => {
                ended = true;
                config.lastStatus = error.message;
                config.failcount += 1;
                if (config.failcount >= this.options.failcount) {
                    config.down = true;
                }
                resolve(config);
            });
        });
    }
}
