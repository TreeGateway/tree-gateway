'use strict';

import * as _ from 'lodash';

export function createFunction(contextVars: any, ...args: string[]) {
    const params = args.length > 1 ? args.slice(0, args.length - 1) : [];
    const constextVarNames = _.keys(contextVars);

    const body = args[args.length - 1];
    const func = new Array<string>();
    func.push(`(function(${constextVarNames.join(',')}){return function(${params.join(',')}){`);
    func.push(body);
    func.push(`};})(${constextVarNames.map(varName => 'contextVars[\'' + varName + '\']').join(',')});`);

    // tslint:disable-next-line:no-eval
    return eval(func.join(''));
}
