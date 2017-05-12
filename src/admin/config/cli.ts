#!/usr/bin/env node
'use strict';

import { configArgs } from './cli-args';
import { Cli } from './cli-tool';

try {
    new Cli(configArgs).processCommand();
} catch (e) {
    console.error(e);
}
