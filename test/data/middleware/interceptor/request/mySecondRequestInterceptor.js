module.exports = function (req) {
    return new Promise((resolve, reject) => {
        var headers = req.headers;
        headers['X-Proxied-2-By'] = 'Tree-Gateway';
        headers['X-Ip'] = req.connection.remoteAddress;
        resolve({ headers: headers });
    });
};