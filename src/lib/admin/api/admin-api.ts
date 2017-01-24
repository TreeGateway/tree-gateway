"use strict";

import {StatsService} from "./stats";
import {MiddlewareRest} from "./middleware";
import {APIRest} from "./api";
import {GroupRest} from "./group";
import {ThrottlingRest} from "./throttling";
import {CacheRest} from "./cache";
import {ProxyRest} from "./proxy";
import {AuthenticationRest} from "./authentication";
import {HealthCheck} from "./health-check";
import {UsersRest} from "./users";

export default [StatsService, MiddlewareRest, APIRest, GroupRest, ThrottlingRest, CacheRest, ProxyRest, AuthenticationRest, HealthCheck, UsersRest];
