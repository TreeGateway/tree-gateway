"use strict";

import {Gateway} from "./gateway";
import {Parameters} from "./command-line";
import {GatewayConfig} from "./config/gateway";

let gateway: Gateway = new Gateway(Parameters.gatewayConfigFile);
gateway.start(()=>{
  gateway.startAdmin();
});
