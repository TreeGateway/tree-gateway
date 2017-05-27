module.exports = function(body, headers, request, callback) {
    var newHeaders = {
        Via: 'Changed By Tree-Gateway'
    };
    callback(null, body, newHeaders);
};