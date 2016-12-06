"use strict";

import * as Joi from "joi";

export interface StatsConfig {
    windowMS: number;
    measurements?: number;
    prefix?: string;
}

export let StatsConfigValidatorSchema = Joi.object().keys({
    windowMS: Joi.number().positive().required(),
    measurements: Joi.number().positive(),
    prefix: Joi.string()
});

export function validateStatsConfig(stats: StatsConfig, callback: (err, value)=>void) {
    Joi.validate(stats, StatsConfigValidatorSchema, callback);
}