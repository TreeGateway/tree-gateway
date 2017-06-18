module.exports = function(body, headers, request) {
    var bodyData = JSON.parse(body);
    bodyData.changedByResponseInterceptor = 'changed';
    console.log('changeBodyResponseInterceptor');
    return {body: bodyData};
};