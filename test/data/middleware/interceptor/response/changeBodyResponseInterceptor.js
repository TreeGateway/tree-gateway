module.exports = function(body, headers, request, callback) {
    var bodyData = JSON.parse(body);
    bodyData.changedByResponseInterceptor = 'changed';
    callback(null, bodyData);
};