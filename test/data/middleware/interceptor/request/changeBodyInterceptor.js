module.exports = function(req) {
    const body = JSON.parse(req.body);
    body.insertedProperty = 'newProperty';
    return {body: body};
};