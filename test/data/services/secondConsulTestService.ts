'use strict';

import * as express from 'express';
import * as consul  from 'consul';
import * as os from 'os';
import * as uuid from 'uuid';
import * as http from 'http';

export class SecondConsulTestService {
    private app: express.Application;
    private static PID = process.pid;
    private static PORT = 4567;
    private static HOST = os.hostname();
    private static CONSUL_ID = `data-${SecondConsulTestService.HOST}-${SecondConsulTestService.PORT}-${uuid.v4()}`;

    private consul: consul.Consul;
    private server: http.Server;

    constructor(consulHost: string, consulPort: string) {
        this.app = express();
        this.consul = consul({host: consulHost, port: consulPort});
    }

    start() {
        return new Promise((resolve, reject) => {
            this.app.get('/', (req, res) => {
                res.json({
                    data: 'service data 2',
                    data_pid: SecondConsulTestService.PID
                });
            });

            this.app.get('/health', (req, res) => {
                res.send('ok');
            });

            this.server = this.app.listen(SecondConsulTestService.PORT, () => {
                const details = {
                    address: SecondConsulTestService.HOST,
                    check: {
                        deregister_critical_service_after: '1m',
                        ttl: '10s'
                    },
                    id: SecondConsulTestService.CONSUL_ID,
                    name: 'secondTestConsulService',
                    port: SecondConsulTestService.PORT
                };

                this.consul.agent.service.register(details, err => {
                    if (err) {
                        return reject(err);
                    }

                    setInterval(() => {
                        this.consul.agent.check.pass({id:`service:${SecondConsulTestService.CONSUL_ID}`}, e => {
                            if (e) {
                                console.error(e);
                            }
                        });
                    }, 5 * 1000);

                    process.on('SIGINT', () => {
                        const opts = {id: SecondConsulTestService.CONSUL_ID};
                        this.consul.agent.service.deregister(opts, (e2) => {
                            process.exit();
                        });
                    });
                    resolve();
                });
            });

        });
    }

    stop() {
        this.server.close();
    }
}
