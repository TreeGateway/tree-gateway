'use strict';

import { BasicStrategy } from 'passport-http';
import { BasicAuthentication } from '../../config/authentication';
import * as pathUtil from 'path';
import { Configuration } from '../../configuration';

module.exports = function(authConfig: BasicAuthentication, config: Configuration) {
    const p = pathUtil.join(config.middlewarePath, 'authentication', 'verify', authConfig.verify);
    const verifyFunction = require(p);
    return new BasicStrategy(verifyFunction);
};
