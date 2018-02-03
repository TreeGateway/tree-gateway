'use strict';

import { JSONAtaExpression, ResponseInterceptorResult, validateJsonAtaExpression } from '../../config/proxy';

const jsonata = require('jsonata');
module.exports = function(config: JSONAtaExpression) {
    validateJsonAtaExpression(config);
    const expression = jsonata(config.expression);
    return (body: any, headers: any, request: any) => {
        return new Promise<ResponseInterceptorResult>((resolve, reject) => {
            try {
                let bodyData = body;
                if (typeof bodyData === 'string' || Buffer.isBuffer(bodyData)) {
                    bodyData = JSON.parse(bodyData.toString());
                }
                const result = expression.evaluate(bodyData);
                resolve({ body: result });
            } catch (e) {
                return reject(e);
            }
        });
    };
};
module.exports.factory = true;
