"use strict";

import {StatsRest} from "./stats";
import {MiddlewareRest} from "./middleware";
import {APIRest} from "./api";
import {HealthCheck} from "./health-check";
import {UsersRest} from "./users";
import {GatewayRest} from "./gateway";

export default [StatsRest, MiddlewareRest, APIRest, HealthCheck, UsersRest, GatewayRest];
