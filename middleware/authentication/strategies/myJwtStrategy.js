"use strict";

var passport = require('passport'),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

module.exports = function (apiKey, authConfig) {
    var opts = {}
    opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
    opts.secretOrKey = 'secret';
    // opts.issuer = "accounts.examplesoft.com";
    // opts.audience = "yoursite.net";
    passport.use(apiKey, new JwtStrategy(opts, function(jwt_payload, done) {
        done(null,jwt_payload.sub);
    }));
};