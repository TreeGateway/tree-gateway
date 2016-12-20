"use strict";

import {StatsService} from "./stats";
import {MiddlewareRest} from "./middleware";
import {APIRest} from "./api";
import {GroupRest} from "./group";
import {ThrottlingRest} from "./throttling";
import {CacheRest} from "./cache";
import {ProxyRest} from "./proxy";
import {AuthenticationRest} from "./authentication";

export default [StatsService, MiddlewareRest, APIRest, GroupRest, ThrottlingRest, CacheRest, ProxyRest, AuthenticationRest];
