'use strict';

import * as xml2js from 'xml2js';

module.exports = function(config: any) {
    const builder = new xml2js.Builder();
    return (req: any) => {
        const result: any = {};
        try {
            let body = req.body;
            if (req.body && typeof req.body === 'string' || Buffer.isBuffer(req.body)) {
                body = JSON.parse(req.body.toString());
            }
            result.body = builder.buildObject(body);
        } catch (e) {
            result.body = '';
        }
        return result;
    };
};
