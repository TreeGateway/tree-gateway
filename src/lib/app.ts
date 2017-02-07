"use strict";

import {Gateway} from "./gateway";
import {Container} from "typescript-ioc";
import {Configuration} from "./configuration";
import {Logger} from "./logger";
import {Database} from "./database";

const config: Configuration = Container.get(Configuration);
config.load()
    .then(()=>{
        const logger: Logger = Container.get(Logger);
        const gateway: Gateway = Container.get(Gateway);
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
            .then(() => process.exit(0));
        }

        // Stop graceful
        process.on('SIGTERM', graceful);
        process.on('SIGINT' , graceful);
    }).catch(console.error);
