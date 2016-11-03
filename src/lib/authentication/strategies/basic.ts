"use strict";

import * as passport from 'passport';
import {BasicStrategy} from 'passport-http';
import * as config from "../../config";
import {Settings} from "../../settings";
import * as pathUtil from "path"; 

module.exports = function (apiKey: string, authConfig: config.BasicAuthentication, settings: Settings) {
    let p = pathUtil.join(settings.middlewarePath, 'authentication', 'verify', authConfig.verify);                
    let verifyFunction = require(p);
    passport.use(apiKey, new BasicStrategy(verifyFunction));
};
