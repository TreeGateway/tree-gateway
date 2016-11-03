"use strict";

import * as passport from 'passport';
import {Strategy} from 'passport-local';
import * as config from "../../config";
import {Settings} from "../../settings";
import * as Utils from "underscore";
import * as pathUtil from "path"; 

module.exports = function (apiKey: string, authConfig: config.LocalAuthentication, settings: Settings) {
    let opts = Utils.omit(authConfig, "verify");
    opts.session = false;
    let p = pathUtil.join(settings.middlewarePath, 'authentication', 'verify', authConfig.verify);                
    let verifyFunction = require(p);
    passport.use(apiKey, new Strategy(opts, verifyFunction));
};
