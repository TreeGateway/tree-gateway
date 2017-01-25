"use strict";

import {Gateway} from "./gateway";
import {Parameters} from "./command-line";

const gateway = new Gateway(Parameters.gatewayConfigFile);

gateway.start()
    .then(() => {
        return gateway.startAdmin();
    })
    .catch((err) => {
        console.log(`Error starting gateway: ${err.message}`);
        process.exit(-1);
    });

function graceful() {
    gateway.stopAdmin()
    .then(() => gateway.stop())
    .then(() => process.exit(0));
}

// Stop graceful
process.on('SIGTERM', graceful);
process.on('SIGINT' , graceful);