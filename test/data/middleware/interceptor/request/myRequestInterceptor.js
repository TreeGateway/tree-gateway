module.exports = function(proxyReq, originalReq) {
    proxyReq.setHeader('X-Proxied-By', 'Tree-Gateway');
};