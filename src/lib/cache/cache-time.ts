"use string";

import * as StringUtils from "underscore.string";

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

    let parts = StringUtils.clean(cacheTime).split(' ');
    if (!parts || parts.length == 0)
    {
        this.gateway.logger.error('Invalid cacheTime [%s].', cacheTime); 
        return 0;
    }
    value = parseInt(parts[0]);
    unit = (parts.length > 1?parts[1]:'second');

    if (!unit || !value) return 0;

    let unitValue = units[unit];
    if (!unitValue) {
        this.gateway.logger.error('Invalid cacheTime unit [%s].', unit); 
        return 0;
    }

    return unitValue * value;
}
