module.exports = function(rsp, data, req, res, callback) {
    res.set('Via', 'Changed By Tree-Gateway');
    callback(null, data);
};