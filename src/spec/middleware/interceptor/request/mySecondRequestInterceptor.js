module.exports = function(proxyReq, originalReq) {
    proxyReq.headers['X-Proxied-2-By'] = 'Tree-Gateway';
    return proxyReq;
};