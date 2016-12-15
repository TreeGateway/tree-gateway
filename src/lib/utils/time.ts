"use string";

import * as _ from "lodash";

const units: any = {};

units.second = 1
units.minute = units.second * 60
units.hour = units.minute * 60
units.day = units.hour * 24
units.week = units.day * 7
units.month = units.day * 30
units.year = units.day * 365

// add plural units
Object.keys(units).forEach(function (unit) {
    units[unit + "s"] = units[unit]
})

export function calculateSeconds(cacheTime: string): number {
    let unit: string, value: number;

    let parts = (cacheTime).replace(/\s\s+/g, ' ').split(' ');
    if (!parts || parts.length == 0)
    {
        throw new Error(`Invalid time configuration [${cacheTime}].`); 
    }
    value = parseInt(parts[0]);
    unit = (parts.length > 1?parts[1]:'second');

    if (!unit || !value) return 0;

    let unitValue = units[unit];
    if (!unitValue) {
        throw new Error(`Invalid time unit [${unit}].`); 
    }

    return unitValue * value;
}
 
