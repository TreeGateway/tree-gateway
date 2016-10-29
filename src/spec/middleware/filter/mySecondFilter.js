"use strict";

var pathToRegexp = require('path-to-regexp');

module.exports = function (req, res) {
    var targetPath = req.path;
//    console.log('second filter called. Req:'+req.originalUrl);
    return req.query.denyParam !== '1';
};