"use strict";
var StringUtils = require("underscore.string");
function normalizePath(path) {
    path = ((StringUtils.startsWith(path, '/')) ? path : '/' + path);
    path = ((StringUtils.endsWith(path, '/')) ? path : path + '/');
    return path;
}
exports.normalizePath = normalizePath;

//# sourceMappingURL=utils.js.map
