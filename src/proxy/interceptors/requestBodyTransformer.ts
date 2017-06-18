'use strict';

import { JSONAtaExpression, validateJsonAtaExpression } from '../../config/proxy';

const jsonata = require('jsonata');
module.exports = function(config: JSONAtaExpression) {
    validateJsonAtaExpression(config);
    const expression = jsonata(config.expression);
    return (proxyReq: any, originalReq: any) => {
        try {
            const body = JSON.parse(originalReq.body);
            originalReq.body = expression.evaluate(body);
        } catch (e) {
            originalReq.body = '';
        }
    };
};
