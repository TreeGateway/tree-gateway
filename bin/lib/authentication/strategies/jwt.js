"use strict";
var passport = require('passport');
var passport_jwt_1 = require('passport-jwt');
var Utils = require("underscore");
var pathUtil = require("path");
module.exports = function (apiKey, authConfig, gateway) {
    var opts = Utils.omit(authConfig, "extractFrom", "verify");
    if (authConfig.extractFrom) {
        var extractors = Utils.keys(authConfig.extractFrom);
        if (extractors.length == 1) {
            opts['jwtFromRequest'] = getExtractor(extractors[0], authConfig.extractFrom[extractors[0]]);
        }
        else {
            var requestExtractors_1 = new Array();
            Utils.keys(authConfig.extractFrom).forEach(function (extractor) {
                requestExtractors_1.push(getExtractor(extractor, authConfig.extractFrom[extractor]));
            });
            opts['jwtFromRequest'] = passport_jwt_1.ExtractJwt['fromExtractors'](requestExtractors_1);
        }
    }
    else {
        opts['jwtFromRequest'] = passport_jwt_1.ExtractJwt.fromAuthHeader();
    }
    var verifyFunction;
    if (authConfig.verify) {
        opts['passReqToCallback'] = true;
        var p = pathUtil.join(gateway.middlewarePath, 'authentication', 'verify', authConfig.verify);
        verifyFunction = require(p);
    }
    else {
        verifyFunction = function (jwtPayload, done) {
            done(null, jwtPayload);
        };
    }
    passport.use(apiKey, new passport_jwt_1.Strategy(opts, verifyFunction));
};
function getExtractor(extractor, param) {
    switch (extractor) {
        case 'header': return passport_jwt_1.ExtractJwt.fromHeader(param);
        case 'queryParam': return passport_jwt_1.ExtractJwt.fromUrlQueryParameter(param);
        case 'authHeader': return passport_jwt_1.ExtractJwt.fromAuthHeaderWithScheme(param);
        case 'bodyField': return passport_jwt_1.ExtractJwt.fromBodyField(param);
        case 'cookie': return function (req) {
            var token = null;
            if (req && req.cookies) {
                token = req.cookies[param];
            }
            return token;
        };
    }
    return passport_jwt_1.ExtractJwt.fromAuthHeader();
}

//# sourceMappingURL=jwt.js.map
