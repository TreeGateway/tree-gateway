'use strict';

import * as express from 'express';

module.exports = function(config: any) {
    return (req: express.Request): string => {
        return 'total';
    };
};
