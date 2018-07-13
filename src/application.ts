'use strict';

import chalk from 'chalk';
import * as cluster from 'cluster';
import * as os from 'os';
import { Container } from 'typescript-ioc';
import { Configuration } from './configuration';
import { Database } from './database';
import { Gateway } from './gateway';
import { VersionUpgrades } from './utils/upgrade';

export class Application {
    public start() {
        if (Configuration.instances === 1) {
            this.standalone();
        } else {
            this.cluster(Configuration.instances);
        }
    }

    public standalone() {
        this.startGateway()
            .catch((err: Error) => {
                // tslint:disable-next-line:no-console
                console.error(chalk.red(`Error starting gateway: ${err.message}`));
                process.exit(-1);
            });
    }

    public cluster(instances: number) {
        if (cluster.isMaster) {
            const n = instances < 1 ? os.cpus().length : instances;
            // tslint:disable-next-line:no-console
            console.info(`Starting child processes...`);

            for (let i = 0; i < n; i++) {
                const env = { processNumber: i + 1 };
                const worker = cluster.fork(env);
                (worker as any).process['env'] = env;
            }

            cluster.on('online', function (worker) {
                // tslint:disable-next-line:no-console
                console.info(`Child process running PID: ${worker.process.pid} PROCESS_NUMBER: ${(worker as any).process['env'].processNumber}`);
            });

            cluster.on('exit', function (worker, code, signal) {
                // tslint:disable-next-line:no-console
                console.info(`PID ${worker.process.pid}  code: ${code}  signal: ${signal}`);
                const env = (worker as any).process['env'];
                const newWorker = cluster.fork(env);
                (newWorker as any).process['env'] = env;
            });
        } else {
            this.startGateway()
                .catch((err: Error) => {
                    // tslint:disable-next-line:no-console
                    console.error(chalk.red(`Error starting gateway: ${err.message}`));
                    process.exit(-1);
                });
        }

        process.on('uncaughtException', function (err: any) {
            // tslint:disable-next-line:no-console
            console.error(err);
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
                config.on('error', error => {
                    this.ensureConfigVersionIsUpdated()
                        .then(() => config.reload())
                        .then(() => this.runGateway())
                        .then(resolve)
                        .catch(() => reject(error));
                });
            }
        });
    }

    private async runGateway() {
        const gateway: Gateway = Container.get(Gateway);
        const database: Database = Container.get(Database);
        if (gateway.running) {
            return;
        }
        async function graceful() {
            await gateway.stopAdmin();
            await gateway.stop();
            await database.disconnect();
            process.exit(0);
        }

        // Stop graceful
        process.on('SIGTERM', graceful);
        process.on('SIGINT', graceful);

        await this.ensureConfigVersionIsUpdated();
        await gateway.start();
        await gateway.startAdmin();
        await database.registerGatewayVersion();
    }

    private ensureConfigVersionIsUpdated() {
        const versions: VersionUpgrades = Container.get(VersionUpgrades);
        return versions.checkGatewayVersion();
    }
}
