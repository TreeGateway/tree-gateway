#!/usr/bin/env node
'use strict';

import './command-line';
import { Application } from './application';

const app = new Application();

app.start();
