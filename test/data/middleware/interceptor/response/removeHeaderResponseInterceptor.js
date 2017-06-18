module.exports = function(body, headers, request) {
    return new Promise((resolve, reject) => {
        console.log('removeHeaderResponseInterceptor');
        resolve({body: body, removeHeaders: ['Via']});
    });
};