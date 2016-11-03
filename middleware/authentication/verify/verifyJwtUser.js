"use strict";

module.exports = function (request, jwt_payload, done){
    console.log('Custom verify function called.');
    done(null, jwt_payload);
};