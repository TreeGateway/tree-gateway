module.exports = function(req) {
    var headers = req.headers;
    headers['X-Proxied-By'] =  'Tree-Gateway';
    return {headers: headers};
};