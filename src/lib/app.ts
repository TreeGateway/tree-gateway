"use strict";

import {Gateway} from "./gateway";
import {Parameters} from "./command-line";

let gateway: Gateway = new Gateway(Parameters.gatewayConfigFile);
gateway.start(()=>{
  gateway.startAdmin();
});
