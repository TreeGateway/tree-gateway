'use strict';

import { JSONAtaExpression, validateJsonAtaExpression } from '../../../config/jsonata';

const jsonata = require('jsonata');
module.exports = function(config: JSONAtaExpression) {
    validateJsonAtaExpression(config);
    const expression = jsonata(config.expression);
    return async (body: any, headers: any, request: any) => {
        let bodyData = body;
        if (typeof bodyData === 'string' || Buffer.isBuffer(bodyData)) {
            bodyData = JSON.parse(bodyData.toString());
        }
        const result = expression.evaluate(bodyData);
        return { body: result };
    };
};
module.exports.factory = true;
