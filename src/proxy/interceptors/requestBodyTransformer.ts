'use strict';

import { JSONAtaExpression, validateJsonAtaExpression } from '../../config/proxy';

const jsonata = require('jsonata');
module.exports = function(config: JSONAtaExpression) {
    validateJsonAtaExpression(config);
    const expression = jsonata(config.expression);
    return (req: any) => {
        const result: any = {};
        try {
            const body = JSON.parse(req.body);
            result.body = expression.evaluate(body);
        } catch (e) {
            result.body = '';
        }
        return result;
    };
};
