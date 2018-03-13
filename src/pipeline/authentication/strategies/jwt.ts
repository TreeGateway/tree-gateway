'use strict';

import { Strategy } from 'passport-strategy';
import { JWTAuthentication, validateJwtAuthConfig } from '../../../config/authentication';
import * as _ from 'lodash';
import * as express from 'express';
import { Container } from 'typescript-ioc';
import { MiddlewareLoader } from '../../../utils/middleware-loader';
import * as jwt from 'jsonwebtoken';

interface JwtExtractor {
    (request: express.Request): string;
}

interface JwtVerifier {
    (req: express.Request, payload: any, done: (error: any, user: any) => void): void;
}

class JwtExtractors {
    static AUTH_HEADER = 'authorization';
    static BEARER_AUTH_SCHEME = 'bearer';
    private static AUTH_HEADER_REGEX = /(\S+)\s+(\S+)/;

    static fromHeader (headerName: string) {
        return (request: express.Request) => {
            let token = null;
            if (request.headers[headerName]) {
                token = request.headers[headerName];
            }
            return token;
        };
    }

    static fromBodyField(fieldName: string) {
        return (request: express.Request) => {
            let token = null;
            if (request.body && request.body.hasOwnProperty(fieldName)) {
                token = request.body[fieldName];
            }
            return token;
        };
    }

    static fromUrlQueryParameter(paramName: string) {
        return (request: express.Request) => {
            let token = null;
            if (request.query.hasOwnProperty(paramName)) {
                token = request.query[paramName];
            }
            return token;
        };
    }

    static fromAuthHeaderWithScheme(authScheme: string) {
        const authSchemeLower = authScheme.toLowerCase();
        return (request: express.Request) => {
            let token = null;
            if (request.headers[JwtExtractors.AUTH_HEADER]) {
                const authParams = JwtExtractors.parseAuthHeader(request.headers[JwtExtractors.AUTH_HEADER]);
                if (authParams && authSchemeLower === authParams.scheme.toLowerCase()) {
                    token = authParams.value;
                }
            }
            return token;
        };
    }

    static fromAuthHeaderAsBearerToken() {
        return JwtExtractors.fromAuthHeaderWithScheme(JwtExtractors.BEARER_AUTH_SCHEME);
    }

    static fromCookie(cookieName: string) {
        return (request: express.Request) => {
            let token = null;
            cookieName = cookieName ? cookieName : 'token';
            if (request  && request.cookies && request.cookies[cookieName]) {
                token = request.cookies[cookieName];
            }
            return token;
        };
    }

    static fromExtractors(extractors: Array<JwtExtractor>) {
        if (!Array.isArray(extractors)) {
            throw new TypeError('extractors.fromExtractors expects an array');
        }

        return (request: express.Request) => {
            let token = null;
            let index = 0;
            while(!token && index < extractors.length) {
                token = extractors[index](request);
                index ++;
            }
            return token;
        };
    }

    private static parseAuthHeader(hdrValue: string | Array<string>) {
        if (_.isArray(hdrValue)) {
            if (hdrValue && hdrValue.length) {
                hdrValue = hdrValue[0];
            } else {
                return null;
            }
        }
        const matches = hdrValue.match(JwtExtractors.AUTH_HEADER_REGEX);
        return matches && { scheme: matches[1], value: matches[2] };
    }
}

interface JwtStrategyOptions {
    algorithms?: Array<string>;
    audience?: string;
    issuer?: string | Array<string>;
    secretOrKey: string;
    jwtFromRequest: JwtExtractor;
    verifyFunction: JwtVerifier;
    ignoreExpiration?: boolean;
}

class JwtStrategy extends Strategy {
    private options: jwt.VerifyOptions;
    private secretOrKey: string;
    private jwtFromRequest: JwtExtractor;
    private verifyFunction: JwtVerifier;

    constructor(options: JwtStrategyOptions) {
        super();
        this.options = {
            algorithms: options.algorithms,
            audience: options.audience,
            ignoreExpiration: !!options.ignoreExpiration,
            issuer: options.issuer,
        };

        this.secretOrKey = options.secretOrKey;
        this.jwtFromRequest = options.jwtFromRequest;
        this.verifyFunction = options.verifyFunction;
    }

    authenticate(req: express.Request) {
        const token = this.jwtFromRequest(req);

        if (!token) {
            return this.fail({message: 'No auth token'}, 401);
        }

        jwt.verify(token, this.secretOrKey, this.options, (err, payload) => {
            if (err) {
                return this.fail({message: 'Invalid token'}, 401);
            } else {
                const verified = (error: any, user: any) => {
                    if(error) {
                        return this.error(error);
                    } else if (!user) {
                        return this.fail(401);
                    } else {
                        return this.success(user, null);
                    }
                };

                try {
                    this.verifyFunction(req, payload, verified);
                } catch(ex) {
                    this.error(ex);
                }
            }
        });
    }
}

module.exports = function(authConfig: JWTAuthentication) {
    validateJwtAuthConfig(authConfig);
    const opts: any = _.omit(authConfig, 'extractFrom', 'verify');
    if (authConfig.extractFrom) {
        const extractors: Array<string> = _.keys(authConfig.extractFrom);
        if (extractors.length === 1) {
            opts.jwtFromRequest = getExtractor(extractors[0], (<any>authConfig).extractFrom[extractors[0]]);
        } else {
            const requestExtractors = new Array<any>();
            _.keys(authConfig.extractFrom).forEach(extractor => {
                requestExtractors.push(getExtractor(extractor, (<any>authConfig).extractFrom[extractor]));
            });
            opts.jwtFromRequest = (<any>JwtExtractors).fromExtractors(requestExtractors);
        }
    } else {
        opts.jwtFromRequest = JwtExtractors.fromAuthHeaderAsBearerToken();
    }
    if (authConfig.verify) {
        const middlewareLoader: MiddlewareLoader = Container.get(MiddlewareLoader);
        opts.verifyFunction = middlewareLoader.loadMiddleware('authentication/verify', authConfig.verify);
    } else {
        opts.verifyFunction = (req: express.Request, jwtPayload: any, done: (error: any, user: any) => void) => {
            done(null, jwtPayload);
        };
    }
    return new JwtStrategy(opts);
};

function getExtractor(extractor: string, param: string) {
    switch (extractor) {
        case 'header': return JwtExtractors.fromHeader(param.toLowerCase());
        case 'queryParam': return JwtExtractors.fromUrlQueryParameter(param);
        case 'authHeader': return JwtExtractors.fromAuthHeaderWithScheme(param);
        case 'bodyField': return JwtExtractors.fromBodyField(param);
        case 'cookie': return JwtExtractors.fromCookie(param);
        default:
            return JwtExtractors.fromAuthHeaderAsBearerToken();
    }
}
module.exports.factory = true;
