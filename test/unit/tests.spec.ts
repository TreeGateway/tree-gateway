'use strict';

import * as install from './install-apis.spec';
import * as admin from './admin.spec';
import * as auth from './authenticator.spec';
import * as cache from './cache.spec';
import * as cors from './cors.spec';
import * as proxy from './proxy.spec';
import * as servicediscovery from './service-discovery.spec';
import * as throttling from './throttling.spec';
import * as uninstall from './uninstall-apis.spec';

export default [install, admin, auth, cache, cors, proxy, servicediscovery, throttling, uninstall];
