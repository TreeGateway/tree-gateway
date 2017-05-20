'use strict';

import * as _ from 'lodash';
const humanInterval = require('human-interval');

export function getMilisecondsInterval(value: string | number) {
    if (_.isNumber(value)) {
        return value;
    }
    return humanInterval(value);
}
