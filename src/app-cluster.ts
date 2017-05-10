#!/usr/bin/env node
'use strict';

import * as cluster from 'cluster';
import * as os from 'os';
import { start } from './start';

// tslint:disable:no-console
if (cluster.isMaster) {
    const n = os.cpus().length;
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
    start()
        .catch((err) => {
            console.error(`Error starting gateway: ${err.message}`);
            process.exit(-1);
        });
}

process.on('uncaughtException', function(err: any) {
    console.log(err);
});
