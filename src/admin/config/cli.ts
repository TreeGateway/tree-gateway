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
                handleConfigError(err);
                database.disconnect();
                process.exit(1);
            });
    });
    config.on('error', error => {
        handleConfigError(error);
    });
} catch (e) {
    console.error(e);
}

function handleConfigError(err: any) {
    let errorMessage;
    if (err && err.response && err.response.body && err.response.body.error) {
        errorMessage = err.response.body.error;
    } else if (err && err.message) {
        errorMessage = err.message;
    } else if (err && err.entity) {
        errorMessage = err.entity;
    } else {
        errorMessage = err;
    }
    try {
        errorMessage = JSON.parse(errorMessage);
        if (errorMessage.entity) {
            errorMessage = errorMessage.entity;
        } else if (errorMessage.message) {
            errorMessage = errorMessage.message;
        }
    } catch (e) {
        // IGNORE
    }

    console.error(errorMessage);
}
