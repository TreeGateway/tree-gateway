"use strict";

var pathToRegexp = require('path-to-regexp');

module.exports = function (req, res) {
    var targetPath = req.path;
    return pathToRegexp('/get/').test(targetPath);
};