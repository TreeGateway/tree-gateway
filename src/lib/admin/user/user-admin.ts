"use strict";

import {UserAdminArgs} from "./user-admin-args";
import {UserAdmin} from "./user-admin-tool";

try {
    new UserAdmin(UserAdminArgs).processCommand();
} catch(e) {
    console.error(e);
}

