'use strict';

import * as xml2js from 'xml2js';
import { ResponseInterceptorResult } from '../../config/proxy';

module.exports = function(config: any) {
    const parser = new xml2js.Parser(config || {});
    return (body: any, headers: any, request: any) => {
        return new Promise<ResponseInterceptorResult>((resolve, reject) => {
            parser.parseString(body, (err: any, data: any) => {
                if (err) {
                    return reject(err);
                }
                resolve({body: data});
            });
        });
    };
};
