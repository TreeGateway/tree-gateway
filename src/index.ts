#!/usr/bin/env node
'use strict';

import { Application } from './application';
import './command-line';

const app = new Application();

app.start();
