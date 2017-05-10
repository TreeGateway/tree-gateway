'use strict';

import { Strategy } from 'passport-local';
import { LocalAuthentication } from '../../config/authentication';
import * as _ from 'lodash';
import * as pathUtil from 'path';
import { Configuration } from '../../configuration';

module.exports = function(authConfig: LocalAuthentication, config: Configuration) {
    const opts: any = _.omit(authConfig, 'verify');
    opts.session = false;
    const p = pathUtil.join(config.middlewarePath, 'authentication', 'verify', authConfig.verify);
    const verifyFunction = require(p);
    return new Strategy(opts, verifyFunction);
};
