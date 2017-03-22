"use strict";

import {UserAdminArgs} from "./user-admin-args";
import {Container} from "typescript-ioc";
import {Configuration} from "../configuration";
import {UserAdmin} from "./user-admin-tool";

let config: Configuration = Container.get(Configuration);
try {
    new UserAdmin(UserAdminArgs).processCommand();
} catch(e) {
    console.error(e);
}

