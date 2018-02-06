'use strict';

import { Strategy } from 'passport-local';
import { LocalAuthentication, validateLocalAuthConfig } from '../../config/authentication';
import * as _ from 'lodash';
import { Container } from 'typescript-ioc';
import { MiddlewareLoader } from '../../utils/middleware-loader';

module.exports = function(authConfig: LocalAuthentication) {
    validateLocalAuthConfig(authConfig);
    const opts: any = _.omit(authConfig, 'verify');
    opts.session = false;
    const middlewareLoader: MiddlewareLoader = Container.get(MiddlewareLoader);
    const verifyFunction = middlewareLoader.loadMiddleware('authentication/verify', authConfig.verify);
    return new Strategy(opts, verifyFunction);
};
module.exports.factory = true;
