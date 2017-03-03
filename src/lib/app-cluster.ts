"use strict";

import "./command-line";
import * as cluster from "cluster";
import * as os from "os";
import {Container} from "typescript-ioc";
import {Logger} from "./logger";
import {Gateway} from "./gateway";
import {Database} from "./database";

if (cluster.isMaster) {
    let n = os.cpus().length;
    console.log(`Starting child processes...`);

    for (let i = 0; i < n; i++) {
        const env = {processNumber: i+1};
        const worker = cluster.fork(env);
        worker.process['env'] = env;
    }

    cluster.on('online', function (worker) {
        console.log(`Child process running PID: ${worker.process.pid} PROCESS_NUMBER: ${worker.process['env'].processNumber}`);
    });

    cluster.on('exit', function (worker, code, signal) {
        console.log(`PID ${worker.process.pid}  code: ${code}  signal: ${signal}`);
        const env = worker.process['env'];
        const newWorker = cluster.fork(env);
        newWorker.process['env'] = env;
    });

    let messages: Map<string, number> = new Map<string, number>();
    let lastWorker: number = 0;

    cluster.on('message', function(worker, message, handle) {
        if (arguments.length === 2) {
            handle = message;
            message = worker;
            worker = undefined;
        }
        if (!messages.has(message.idMsg)) {
            let selectedWorker = (++lastWorker) % n;

            messages.set(message.idMsg, selectedWorker);
            setTimeout(() => {
                messages.clear();
            }, 2000);
            for (const id in cluster.workers) {
                let w = cluster.workers[id];
                if (w.process['env'].processNumber == selectedWorker) {
                    switch(message.message) {
                        case 'middleware.installAll': 
                            return w.send({workerId: selectedWorker, message: 'middleware.installAll'});
                        case 'middleware.install': 
                            return w.send({workerId: selectedWorker, type: message.type, name: message.name, message: 'middleware.install'});
                        case 'middleware.uninstall': 
                            return w.send({workerId: selectedWorker, type: message.type, name: message.name, message: 'middleware.uninstall'});
                    }
                }
            }
        }
    });    
} 
else {
    const logger: Logger = Container.get(Logger);
    const gateway: Gateway = Container.get(Gateway);
    const database: Database = Container.get(Database);
    gateway.start()
        .then(() => {
            return gateway.startAdmin();
        })
        .catch((err) => {
            logger.error(`Error starting gateway: ${err.message}`);
            process.exit(-1);
        });

    const graceful = () => {
        gateway.stopAdmin()
        .then(() => gateway.stop())
        .then(() => database.disconnect())
        .then(() => process.exit(0));
    };

    // Stop graceful
    process.on('SIGTERM', graceful);
    process.on('SIGINT' , graceful);
}

process.on('uncaughtException', function (err) {
    console.log(err);
});