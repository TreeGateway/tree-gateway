'use strict';

import './command-line';
import { Configuration } from './configuration';
import { Container } from 'typescript-ioc';
import { Gateway } from './gateway';
import { Database } from './database';

export function start(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const config: Configuration = Container.get(Configuration);
        config.on('load', () => {
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
    });
}
