'use strict';

import { BasicStrategy } from 'passport-http';
import { BasicAuthentication, validateBasicAuthConfig } from '../../config/authentication';
import { Container } from 'typescript-ioc';
import { MiddlewareLoader } from '../../utils/middleware-loader';

module.exports = function(authConfig: BasicAuthentication) {
    validateBasicAuthConfig(authConfig);
    const middlewareLoader: MiddlewareLoader = Container.get(MiddlewareLoader);
    const verifyFunction = middlewareLoader.loadMiddleware('authentication/verify', authConfig.verify);
    return new BasicStrategy(verifyFunction);
};
