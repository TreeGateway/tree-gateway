"use strict";

import * as express from "express";
import * as logger from "morgan";
import {Gateway} from "./gateway";
import * as fs from "fs-extra";
import * as compression from "compression";
import {Parameters} from "./command-line";
import {APIService} from "./admin/admin-server";
import * as path from "path";
import {Server} from "typescript-rest";
import {GatewayConfig} from "./config/gateway";

let gateway: Gateway = new Gateway(Parameters.gatewayConfigFile);
gateway.start(()=>{
  gateway.startAdmin();
});
