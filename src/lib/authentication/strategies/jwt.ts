"use strict";

import {Strategy, StrategyOptions, ExtractJwt} from 'passport-jwt';
import {Gateway} from "../../gateway"; 
import {JWTAuthentication} from "../../config/authentication";
import * as _ from "lodash";
import * as pathUtil from "path"; 
import {Configuration} from "../../configuration";

module.exports = function (authConfig: JWTAuthentication, config: Configuration) {
    let opts = _.omit(authConfig, "extractFrom", "verify");
    if (authConfig.extractFrom) {
        let extractors: Array<string> = _.keys(authConfig.extractFrom);
        if (extractors.length == 1){
            opts['jwtFromRequest'] = getExtractor(extractors[0], authConfig.extractFrom[extractors[0]]);
        }
        else {
            let requestExtractors = new Array<any>()
            _.keys(authConfig.extractFrom).forEach(extractor=>{
                requestExtractors.push(getExtractor(extractor, authConfig.extractFrom[extractor]));
            });
            opts['jwtFromRequest'] = ExtractJwt['fromExtractors'](requestExtractors);
        }
    }
    else {
        opts['jwtFromRequest'] = ExtractJwt.fromAuthHeader();
    }
    let verifyFunction;
    if (authConfig.verify) {
        opts['passReqToCallback'] = true;
        let p = pathUtil.join(config.gateway.middlewarePath, 'authentication', 'verify', authConfig.verify);                
        verifyFunction = require(p);
    }
    else {
        verifyFunction = (jwtPayload, done) => {
            done(null, jwtPayload);
        };
    }
    return new Strategy(<StrategyOptions>opts, verifyFunction);
};

function getExtractor(extractor: string, param: string) {
    switch(extractor) {
        case 'header': return ExtractJwt.fromHeader(param);
        case 'queryParam': return ExtractJwt.fromUrlQueryParameter(param);
        case 'authHeader': return ExtractJwt.fromAuthHeaderWithScheme(param);
        case 'bodyField': return ExtractJwt.fromBodyField(param);
        case 'cookie': return (req)=>{
            let token = null;
            if (req && req.cookies)
            {
                token = req.cookies[param];
            }
            return token;
        };            
    }

    return ExtractJwt.fromAuthHeader();
}
