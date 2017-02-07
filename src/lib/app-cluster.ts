"use strict";

import * as cluster from "cluster";
import * as os from "os";
import { Gateway } from "./gateway";
import {Container} from "typescript-ioc";

if (cluster.isMaster) {
    var n = os.cpus().length;
    console.log(`Starting child processes...`);

    for (var i = 0; i < n; i++) {
        const env = {processNumber: i};
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
} 
else {
    const gateway = Container.get(Gateway);

    gateway.start()
        .then(() => {
            return gateway.startAdmin();
        })
        .catch((err) => {
            console.log(`Error starting gateway: ${err.message}`);
            process.exit(-1);
        });

    process.on('SIGTERM', () => gateway.stopAdmin().then(()=>gateway.stop()).then(()=>process.exit(0)));
    process.on('SIGINT' , () => gateway.stopAdmin().then(()=>gateway.stop()).then(()=>process.exit(0)));
        
}

process.on('uncaughtException', function (err) {
    console.log(err);
});