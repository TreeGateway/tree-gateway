#!/usr/bin/env node
'use strict';

import { configArgs } from './cli-args';
import { Cli } from './cli-tool';
import { Configuration } from '../../configuration';
import { Container } from 'typescript-ioc';
import { Database } from '../../database';

try {
    const config: Configuration = Container.get(Configuration);
    config.on('load', () => {
        const database: Database = Container.get(Database);
        new Cli(configArgs).processCommand()
            .then(() => {
                database.disconnect();
            }).catch((err: any) => {
                console.error(`${err}`);
                database.disconnect();
                process.exit(1);
            });
    });
} catch (e) {
    console.error(e);
}
