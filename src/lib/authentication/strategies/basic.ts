"use strict";

import {BasicStrategy} from 'passport-http';
import {Gateway} from "../../gateway"; 
import {BasicAuthentication} from "../../config/authentication";
import * as pathUtil from "path"; 
import {Configuration} from "../../configuration";


module.exports = function (authConfig: BasicAuthentication, config: Configuration) {
    let p = pathUtil.join(config.gateway.middlewarePath, 'authentication', 'verify', authConfig.verify);                
    let verifyFunction = require(p);
    return new BasicStrategy(verifyFunction);
};
