"use strict";
import * as StringUtils from "underscore.string";

export function normalizePath(path: string) {
    path = ((StringUtils.startsWith(path, '/'))?path:'/'+path);
    path = ((StringUtils.endsWith(path, '/'))?path:path+'/');
    return path;
}
