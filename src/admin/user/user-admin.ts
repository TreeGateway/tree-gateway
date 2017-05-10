'use strict';

import { userAdminArgs } from './user-admin-args';
import { UserAdmin } from './user-admin-tool';

try {
    new UserAdmin(userAdminArgs).processCommand();
} catch (e) {
    console.error(e);
}
