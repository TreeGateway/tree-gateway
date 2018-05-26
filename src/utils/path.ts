'use strict';
import * as _ from 'lodash';

export function normalizePath(path: string) {
    if (!path) {
        return path;
    }
    path = path.trim();
    const negate = _.startsWith(path, '!');
    if (negate) {
        path = path.substring(1);
    }
    path = ((_.startsWith(path, '/')) ? path : '/' + path);
    path = ((_.endsWith(path, '/')) ? path.slice(0,-1) : path);
    if (negate) {
        path = `!${path}`;
    }
    return path;
}
