'use strict';

import * as Joi from 'joi';
import * as chooser from 'weighted';
import { ValidationError } from '../../error/errors';

interface TrafficSplitConfig {
    destinations: Array<TrafficDestination>;
}

interface TrafficDestination {
    target: string;
    weight: number;
}

const trafficSplitConfigSchema = Joi.object().keys({
    destinations: Joi.array().items(Joi.object().keys({
        target: Joi.string().required(),
        weight: Joi.number().required()
    })).min(1).required()
});

function validateTrafficSplitConfig(config: TrafficSplitConfig) {
    const result = Joi.validate(config, trafficSplitConfigSchema);
    if (result.error) {
        throw new ValidationError(result.error);
    } else {
        return result.value;
    }
}

module.exports = function(config: TrafficSplitConfig) {
    validateTrafficSplitConfig(config);
    const values = config.destinations.map(destination => destination.target);
    const weights = config.destinations.map(destination => destination.weight);
    return (req: any) => {
        return chooser.select(values, weights);
    };
};
