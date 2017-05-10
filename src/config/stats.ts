'use strict';

import * as Joi from 'joi';
import { ValidationError } from '../error/errors';

export interface StatsConfig {
    /**
     * The time serie granularity configuration
     */
    granularity: GranularityConfig;
    /**
     * A prefix for the timeseries keys on database ()
     */
    prefix?: string;
}

export interface GranularityConfig {
    /**
     * The amout of time used to agregate the time series
     */
    duration: string;
    /**
     * Time to live for each time serie
     */
    ttl: string;
    /**
     * A prefix for the timeseries keys on database ()
     */
    prefix?: string;
}

const granularityValidatorSchema = Joi.object().keys({
    duration: Joi.string().required(),
    ttl: Joi.string().required(),
});

export const statsConfigValidatorSchema = Joi.object().keys({
    granularity: granularityValidatorSchema.required(),
    prefix: Joi.string()
});

export function validateStatsConfig(stats: StatsConfig) {
    return new Promise((resolve, reject) => {
        Joi.validate(stats, statsConfigValidatorSchema, (err, value) => {
            if (err) {
                reject(new ValidationError(err));
            } else {
                resolve(value);
            }
        });
    });
}
