module.exports = function(proxyReq, originalReq) {
    proxyReq.headers['X-Proxied-By'] = 'Tree-Gateway';
    return proxyReq;
};