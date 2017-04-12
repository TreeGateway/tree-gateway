"use strict";

import * as _ from "lodash";

export function checkEnvVariable(value: string|number, asNumber?:boolean) {
        if (_.isNumber(value)) {
            return value;
        }
        if (_.startsWith(value, '{') && _.endsWith(value, '}')) {
            const envVariable = value.substring(1, value.length - 1);
            if (asNumber) {
                return parseInt(process.env[envVariable]);
            }
            return process.env[envVariable];
        }
        return value;
    }
