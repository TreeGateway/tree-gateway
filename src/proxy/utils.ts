'use strict';
import * as _ from 'lodash';

export function normalizePath(path: string) {
    path = ((_.startsWith(path, '/')) ? path : '/' + path);
    path = ((_.endsWith(path, '/')) ? path.slice(0,-1) : path);
    return path;
}
