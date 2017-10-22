'use strict';

import { StatsRest } from './stats';
import { MiddlewareRest } from './middleware';
import { APIRest } from './api';
import { UsersRest } from './users';
import { GatewayRest } from './gateway';

export default [StatsRest, MiddlewareRest, APIRest, UsersRest, GatewayRest];
