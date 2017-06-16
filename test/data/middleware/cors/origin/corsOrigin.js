"use strict";

var pathToRegexp = require('path-to-regexp');

module.exports = function (origin) {
    return new Promise((resolve, reject) => {
        setTimeout(function(){resolve(true);}, 10);
    });;
};