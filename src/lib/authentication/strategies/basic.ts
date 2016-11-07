"use strict";

import * as passport from 'passport';
import {BasicStrategy} from 'passport-http';
import {Gateway} from "../../gateway"; 
import {BasicAuthentication} from "../../config/authentication";
import * as pathUtil from "path"; 

module.exports = function (apiKey: string, authConfig: BasicAuthentication, gateway: Gateway) {
    let p = pathUtil.join(gateway.middlewarePath, 'authentication', 'verify', authConfig.verify);                
    let verifyFunction = require(p);
    passport.use(apiKey, new BasicStrategy(verifyFunction));
};
