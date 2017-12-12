'use strict';

module.exports = function erroHandler(opts) {
    return (err, req, res, next) => {
        if (err && err.message) {
            if (res.headersSent) { // important to allow default error handler to close connection if headers already sent
                return next(err);
            }
            const mime = req.accepts('json', 'xml', 'html', 'text');
            res.status(err.statusCode || err.status || 500);
            switch (mime) {
                case 'json':
                    res.set('Content-Type', 'application/json');
                    res.json({ error: err.message });
                    break;
                case 'xml':
                    res.set('Content-Type', 'application/xml');
                    res.send(`<error>${err.message}</error>`);
                    break;
                case 'html':
                    res.set('Content-Type', 'text/html');
                    res.send(`<html><head></head><body>${err.message}</body></html>`);
                    break;
                default:
                    res.set('Content-Type', 'text/plain');
                    res.send(err.message);
            }
            console.log(`Error on API pipeline processing: ${err.message}`);
            console.log(err);
        } else {
            next(err);
        }
    };
}
