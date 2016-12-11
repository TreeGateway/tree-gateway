"use strict";

import {MiddlewareRest} from "./middleware";
import {APIRest} from "./api";
import {GroupRest} from "./group";
import {ThrottlingRest} from "./throttling";
import {CacheRest} from "./cache";
import {ProxyRest} from "./proxy";

export default [MiddlewareRest, APIRest, GroupRest, ThrottlingRest, CacheRest, ProxyRest];