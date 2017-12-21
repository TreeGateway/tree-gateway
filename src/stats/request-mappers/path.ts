'use strict';

import * as express from 'express';
import { normalizePath } from '../../utils/path';

module.exports = function(req: express.Request) {
    return normalizePath(req.path);
};
