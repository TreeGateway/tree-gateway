"use strict";

import "./command-line";
import {Container} from "typescript-ioc";
import {Logger} from "./logger";
import {Gateway} from "./gateway";
import {Database} from "./database";

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

function graceful() {
    gateway.stopAdmin()
    .then(() => gateway.stop())
    .then(() => database.disconnect())
    .then(() => process.exit(0));
}

// Stop graceful
process.on('SIGTERM', graceful);
process.on('SIGINT' , graceful);
