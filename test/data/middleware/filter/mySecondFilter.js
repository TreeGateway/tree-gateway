"use strict";

module.exports = function (req, res) {
    var targetPath = req.path;
    console.log('second filter called. Req:'+req.originalUrl);
    return new Promise((resolve, reject) => {
        setTimeout(function(){resolve(req.query.denyParam !== '1');}, 10);
    });
};