'use strict';

import { APIRest } from './api';
import { ConfigPackageRest } from './config-package';
import { GatewayRest } from './gateway';
import { HealthCheck } from './health-check';
import { MiddlewareRest } from './middleware';
import { UsersRest } from './users';

export default [MiddlewareRest, APIRest, ConfigPackageRest, HealthCheck, UsersRest, GatewayRest];
