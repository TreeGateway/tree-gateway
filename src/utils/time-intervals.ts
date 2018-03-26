'use strict';

import * as _ from 'lodash';
const humanInterval = require('human-interval');

humanInterval.languageMap['eleven'] = 11;
humanInterval.languageMap['twelve'] = 12;
humanInterval.languageMap['thirteen'] = 13;
humanInterval.languageMap['fourteen'] = 14;
humanInterval.languageMap['fifteen'] = 15;
humanInterval.languageMap['sixteen'] = 16;
humanInterval.languageMap['seventeen'] = 17;
humanInterval.languageMap['eighteen'] = 18;
humanInterval.languageMap['nineteen'] = 19;
humanInterval.languageMap['twenty'] = 20;
humanInterval.languageMap['thirty'] = 30;
humanInterval.languageMap['fourty'] = 40;
humanInterval.languageMap['fifty'] = 50;
humanInterval.languageMap['sixty'] = 60;
humanInterval.languageMap['seventy'] = 70;
humanInterval.languageMap['eighty'] = 80;
humanInterval.languageMap['ninety'] = 90;
humanInterval.languageMap['hundred'] = 100;

export function getMilisecondsInterval(value: string | number | undefined, defaultValue?: number) {
    if (!value) {
        return defaultValue;
    }
    if (_.isNumber(value)) {
        return value;
    }
    return humanInterval(value);
}
