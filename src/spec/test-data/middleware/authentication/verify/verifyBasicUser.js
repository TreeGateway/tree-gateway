"use strict";

module.exports = function (userid, password, done){
    // console.log('Custom verify function called.');
    if (userid === 'test' && password === 'test123'){
        done(null, userid);
    }
    else {
        done(false);
    }
};