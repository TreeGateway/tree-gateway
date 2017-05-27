module.exports = function(proxyReq, originalReq) {
    const body = JSON.parse(originalReq.body);
    body.insertedProperty = 'newProperty';
    originalReq.body = body;
};