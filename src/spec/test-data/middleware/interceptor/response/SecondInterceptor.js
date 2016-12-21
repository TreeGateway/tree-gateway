module.exports = function(rsp, data, req, res, callback) {
    var previousInterceptorHeader = res.get('Via'); 
    res.set('Via', 'previous Interceptor wrote: ' + previousInterceptorHeader);
    callback(null, data);
};