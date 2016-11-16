"use strict";

var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

module.exports = function (authConfig) {
    var opts = {}
    opts.jwtFromRequest = ExtractJwt.fromUrlQueryParameter('jwt');
    opts.secretOrKey = authConfig.secret;
    return new JwtStrategy(opts, function(jwt_payload, done) {
        done(null,jwt_payload.sub);
    });
};