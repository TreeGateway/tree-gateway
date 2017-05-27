module.exports = function(proxyReq, originalReq) {
    proxyReq.setHeader('X-Proxied-2-By',  'Tree-Gateway');
};