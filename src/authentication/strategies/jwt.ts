'use strict';

import { Strategy, StrategyOptions, ExtractJwt } from 'passport-jwt';
import { JWTAuthentication } from '../../config/authentication';
import * as _ from 'lodash';
import * as pathUtil from 'path';
import * as express from 'express';
import { Configuration } from '../../configuration';

module.exports = function(authConfig: JWTAuthentication, config: Configuration) {
    const opts: any = _.omit(authConfig, 'extractFrom', 'verify');
    if (authConfig.extractFrom) {
        const extractors: Array<string> = _.keys(authConfig.extractFrom);
        if (extractors.length === 1) {
            opts['jwtFromRequest'] = getExtractor(extractors[0], (<any>authConfig).extractFrom[extractors[0]]);
        } else {
            const requestExtractors = new Array<any>();
            _.keys(authConfig.extractFrom).forEach(extractor => {
                requestExtractors.push(getExtractor(extractor, (<any>authConfig).extractFrom[extractor]));
            });
            opts['jwtFromRequest'] = (<any>ExtractJwt).fromExtractors(requestExtractors);
        }
    } else {
        opts['jwtFromRequest'] = ExtractJwt.fromAuthHeader();
    }
    let verifyFunction;
    if (authConfig.verify) {
        opts['passReqToCallback'] = true;
        const p = pathUtil.join(config.middlewarePath, 'authentication', 'verify', authConfig.verify);
        verifyFunction = require(p);
    } else {
        verifyFunction = (jwtPayload: any, done: any) => {
            done(null, jwtPayload);
        };
    }
    return new Strategy(<StrategyOptions>opts, verifyFunction);
};

function getExtractor(extractor: string, param: string) {
    switch (extractor) {
        case 'header': return ExtractJwt.fromHeader(param);
        case 'queryParam': return ExtractJwt.fromUrlQueryParameter(param);
        case 'authHeader': return ExtractJwt.fromAuthHeaderWithScheme(param);
        case 'bodyField': return ExtractJwt.fromBodyField(param);
        case 'cookie': return (req: express.Request) => {
            let token = null;
            if (req && req.cookies) {
                token = req.cookies[param];
            }
            return token;
        };
        default:
            return ExtractJwt.fromAuthHeader();
    }
}
