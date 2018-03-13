'use strict';

import { JSONAtaExpression, validateJsonAtaExpression } from '../../../config/jsonata';

const jsonata = require('jsonata');
module.exports = function(config: JSONAtaExpression) {
    validateJsonAtaExpression(config);
    const expression = jsonata(config.expression);
    return (req: any) => {
        const result: any = {};
        try {
            let body = req.body;
            if (typeof body === 'string' || Buffer.isBuffer(req.body)) {
                body = JSON.parse(body.toString());
            }
            result.body = expression.evaluate(body);
        } catch (e) {
            result.body = '';
        }
        return result;
    };
};
module.exports.factory = true;
