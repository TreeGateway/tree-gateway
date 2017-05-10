'use strict';

import { start } from './start';

start()
    .catch((err) => {
        console.error(`Error starting gateway: ${err.message}`);
        process.exit(-1);
    });
