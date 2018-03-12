"use strict";

var Strategy = require('passport-strategy')

class JwtStrategy extends Strategy {
    constructor() {
        super();
    }

    authenticate(req) {
        const token = req.query.jwt;
        if (token) {
            this.success({}, null);
        } else {
            this.fail(401);
        }
    }
}

module.exports = function (authConfig) {
    return new JwtStrategy();
}; 
module.exports.factory = true;
