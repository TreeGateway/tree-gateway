"use strict";

var pathToRegexp = require('path-to-regexp');

module.exports = function (req, res) {
    var targetPath = req.path;
//    console.log('custom filter called. Req:'+req.originalUrl);
    return pathToRegexp('/get/').test(targetPath);
};