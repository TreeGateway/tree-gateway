'use strict';

import * as express from 'express';
import { normalizePath } from '../../utils/path';

module.exports = function(config: any) {
    return (req: express.Request): string => {
        return `${req.method} - ${normalizePath(req.path)}`;
    };
};
