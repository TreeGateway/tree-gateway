module.exports = function(body, headers, request, callback) {
    callback(null, body, null, ['Via']);
};