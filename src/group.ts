'use strict';

import * as _ from 'lodash';
import * as express from 'express';
import { Group } from './config/group';
import * as Utils from './proxy/utils';
import {createFunction} from './utils/functions';

const pathToRegexp = require('path-to-regexp');

export function filter(groups: Array<Group>, groupIds: Array<string>) {
    const filtered = _.filter(groups, (g: Group) => {
        return groupIds.indexOf(g.id) >= 0;
    });
    return filtered;
}

export function buildGroupAllowFilter(groups: Array<Group>, groupIds: Array<string>): (req: express.Request, res: express.Response) => boolean {
    const body = `return ${buildGroupAllowTest('req', groups, groupIds)};`;
    return <(req: express.Request, res: express.Response) => boolean> createFunction({pathToRegexp: pathToRegexp}, 'req', 'res', body);
}

export function buildGroupAllowTest(request: string, groups: Array<Group>, groupIds: Array<string>) {
    const func = new Array<string>();
    const filtered = filter(groups, groupIds);
    filtered.forEach((group, index) => {
        if (index > 0) {
            func.push(`||`);
        }
        func.push(`(`);
        group.member.forEach((member, memberIndex) => {
            if (memberIndex > 0) {
                func.push(`||`);
            }
            func.push(`(`);
            let hasMethodFilter = false;
            if (member.method && member.method.length > 0) {
                func.push(`(`);
                hasMethodFilter = true;
                member.method.forEach((method, i) => {
                    if (i > 0) {
                        func.push(`||`);
                    }
                    func.push(`(${request}.method === '${method.toUpperCase()}')`);
                });
                func.push(`)`);
            }
            let hasProtocolFilter = false;
            if (member.protocol && member.protocol.length > 0) {
                if (hasMethodFilter) {
                    func.push(`&&`);
                }
                func.push(`(`);
                hasProtocolFilter = true;
                member.protocol.forEach((protocol, i) => {
                    if (i > 0) {
                        func.push(`||`);
                    }
                    func.push(`(${request}.protocol === '${protocol.toLowerCase()}')`);
                });
                func.push(`)`);
            }
            if (member.path && member.path.length > 0) {
                if (hasMethodFilter || hasProtocolFilter) {
                    func.push(`&&`);
                }
                func.push(`(`);
                member.path.forEach((path, i) => {
                    if (i > 0) {
                        func.push(`||`);
                    }
                    func.push(`(pathToRegexp('${Utils.normalizePath(path)}').test(${request}.path))`);
                });
                func.push(`)`);
            }
            func.push(`)`);
        });
        func.push(`)`);
    });

    return func.join('');
}

export function buildGroupDenyFilter(groups: Array<Group>, names: Array<string>): (req: express.Request, res: express.Response) => boolean {
    const body = `return ${buildGroupDenyTest('req', groups, names)}`;
    return <(req: express.Request, res: express.Response) => boolean> createFunction({pathToRegexp: pathToRegexp}, 'req', 'res', body);
}

export function buildGroupDenyTest(request: string, groups: Array<Group>, names: Array<string>) {
    const func = new Array<string>();
    const filtered = filter(groups, names);
    filtered.forEach((group, index) => {
        if (index > 0) {
            func.push(`&&`);
        }
        func.push(`(`);
        group.member.forEach((member, memberIndex) => {
            if (memberIndex > 0) {
                func.push(`&&`);
            }
            func.push(`(`);
            let hasMethodFilter = false;
            if (member.method && member.method.length > 0) {
                func.push(`(`);
                hasMethodFilter = true;
                member.method.forEach((method, i) => {
                    if (i > 0) {
                        func.push(`&&`);
                    }
                    func.push(`(${request}.method !== '${method.toUpperCase()}')`);
                });
                func.push(`)`);
            }
            let hasProtocolFilter = false;
            if (member.protocol && member.protocol.length > 0) {
                if (hasMethodFilter) {
                    func.push(`&&`);
                }
                func.push(`(`);
                hasProtocolFilter = true;
                member.protocol.forEach((protocol, i) => {
                    if (i > 0) {
                        func.push(`&&`);
                    }
                    func.push(`(${request}.protocol !== '${protocol.toLowerCase()}')`);
                });
                func.push(`)`);
            }
            if (member.path && member.path.length > 0) {
                if (hasMethodFilter || hasProtocolFilter) {
                    func.push(`&&`);
                }
                func.push(`(`);
                member.path.forEach((path, i) => {
                    if (i > 0) {
                        func.push(`&&`);
                    }
                    func.push(`!(pathToRegexp('${Utils.normalizePath(path)}').test(${request}.path))`);
                });
                func.push(`)`);
            }
            func.push(`)`);
        });
        func.push(`)`);
    });

    return func.join('');
}

export function buildGroupNotAllowTest(request: string, groups: Array<Group>, names: Array<string>) {
    const func = new Array<string>();
    const filtered = filter(groups, names);

    filtered.forEach((group, index) => {
        if (index > 0) {
            func.push(`||`);
        }
        func.push(`(`);
        group.member.forEach((member, memberIndex) => {
            if (memberIndex > 0) {
                func.push(`&&`);
            }
            func.push(`(`);
            let hasMethodFilter = false;
            if (member.method && member.method.length > 0) {
                func.push(`(`);
                hasMethodFilter = true;
                member.method.forEach((method, i) => {
                    if (i > 0) {
                        func.push(`&&`);
                    }
                    func.push(`(${request}.method ==! '${method.toUpperCase()}')`);
                });
                func.push(`)`);
            }
            let hasProtocolFilter = false;
            if (member.protocol && member.protocol.length > 0) {
                if (hasMethodFilter) {
                    func.push(`||`);
                }
                func.push(`(`);
                hasProtocolFilter = true;
                member.protocol.forEach((protocol, i) => {
                    if (i > 0) {
                        func.push(`&&`);
                    }
                    func.push(`(${request}.protocol ==! '${protocol.toLowerCase()}')`);
                });
                func.push(`)`);
            }
            if (member.path && member.path.length > 0) {
                if (hasMethodFilter || hasProtocolFilter) {
                    func.push(`||`);
                }
                func.push(`(`);
                member.path.forEach((path, mIndex) => {
                    if (mIndex > 0) {
                        func.push(`&&`);
                    }
                    func.push(`!(pathToRegexp('${Utils.normalizePath(path)}').test(${request}.path))`);
                });
                func.push(`)`);
            }
            func.push(`)`);
        });
        func.push(`)`);
    });
    return func.join('');
}
