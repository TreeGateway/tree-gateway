"use strict";

import {UserAdminArgs} from "./user-admin-args";
import {Container} from "typescript-ioc";
import {Configuration} from "../configuration";
import {UserAdmin} from "./user-admin-tool";

let config = Container.get(Configuration);
config.load(UserAdminArgs.config)
    .then(()=>{ 
        new UserAdmin(UserAdminArgs).processCommand();
    })
    .catch(console.error)

