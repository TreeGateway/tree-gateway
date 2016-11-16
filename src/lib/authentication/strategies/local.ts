"use strict";

import {Strategy} from 'passport-local';
import {Gateway} from "../../gateway"; 
import {LocalAuthentication} from "../../config/authentication";
import * as Utils from "underscore";
import * as pathUtil from "path"; 

module.exports = function (authConfig: LocalAuthentication, gateway: Gateway) {
    let opts = Utils.omit(authConfig, "verify");
    opts.session = false;
    let p = pathUtil.join(gateway.middlewarePath, 'authentication', 'verify', authConfig.verify);                
    let verifyFunction = require(p);
    return new Strategy(opts, verifyFunction);
};
