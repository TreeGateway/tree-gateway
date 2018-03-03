'use strict';

import { MiddlewareRest } from './middleware';
import { APIRest } from './api';
import { ConfigPackageRest } from './config-package';
import { HealthCheck } from './health-check';
import { UsersRest } from './users';
import { GatewayRest } from './gateway';

export default [MiddlewareRest, APIRest, ConfigPackageRest, HealthCheck, UsersRest, GatewayRest];
