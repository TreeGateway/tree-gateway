module.exports = function(body, headers, request, callback) {
    var newHeaders = {
        Via: 'Changed By Tree-Gateway'
    };
    console.log('myResponseInterceptor');
    return {body: body, updateHeaders: newHeaders};
};