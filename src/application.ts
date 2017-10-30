'use strict';

import * as cluster from 'cluster';
import * as os from 'os';
import { Configuration } from './configuration';
import { Container } from 'typescript-ioc';
import { Gateway } from './gateway';
import { Database } from './database';

export class Application {
    start() {
        if (Configuration.instances === 1) {
            this.standalone();
        } else {
            this.cluster(Configuration.instances);
        }
    }

    standalone() {
        this.startGateway()
            .catch((err: Error) => {
                console.error(`Error starting gateway: ${err.message}`);
                process.exit(-1);
            });
    }

    cluster(instances: number) {
        // tslint:disable:no-console
        if (cluster.isMaster) {
            const n = instances < 1 ? os.cpus().length : instances;
            console.log(`Starting child processes...`);

            for (let i = 0; i < n; i++) {
                const env = { processNumber: i + 1 };
                const worker = cluster.fork(env);
                (<any>worker).process['env'] = env;
            }

            cluster.on('online', function(worker) {
                console.log(`Child process running PID: ${worker.process.pid} PROCESS_NUMBER: ${(<any>worker).process['env'].processNumber}`);
            });

            cluster.on('exit', function(worker, code, signal) {
                console.log(`PID ${worker.process.pid}  code: ${code}  signal: ${signal}`);
                const env = (<any>worker).process['env'];
                const newWorker = cluster.fork(env);
                (<any>newWorker).process['env'] = env;
            });
        } else {
            this.startGateway()
                .catch((err: Error) => {
                    console.error(`Error starting gateway: ${err.message}`);
                    process.exit(-1);
                });
        }

        process.on('uncaughtException', function(err: any) {
            console.log(err);
        });
    }

    private startGateway(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const config: Configuration = Container.get(Configuration);
            if (config.loaded) {
                this.runGateway().then(resolve).catch(reject);
            } else {
                config.on('load', () => {
                    this.runGateway().then(resolve).catch(reject);
                });
            }
        });
    }

    private runGateway() {
        return new Promise<void>((resolve, reject) => {
            const gateway: Gateway = Container.get(Gateway);
            const database: Database = Container.get(Database);
            if (gateway.running) {
                return resolve();
            }
            gateway.start()
                .then(() => gateway.startAdmin())
                .then(resolve)
                .catch(reject);

            function graceful() {
                gateway.stopAdmin()
                    .then(() => gateway.stop())
                    .then(() => database.disconnect())
                    .then(() => process.exit(0));
            }

            // Stop graceful
            process.on('SIGTERM', graceful);
            process.on('SIGINT', graceful);
        });
    }
}
