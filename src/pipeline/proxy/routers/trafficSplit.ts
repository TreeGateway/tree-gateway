'use strict';

import * as Joi from 'joi';
import * as _ from 'lodash';
import * as chooser from 'weighted';
import { ValidationError } from '../../../config/errors';

interface TrafficSplitConfig {
    destinations: Array<TrafficDestination>;
}

interface TrafficDestination {
    target: string;
    weight: number;
}

const destinationConfig = Joi.object().keys({
    target: Joi.string().required(),
    weight: Joi.number().required()
});
const trafficSplitConfigSchema = Joi.object().keys({
    destinations: Joi.alternatives([Joi.array().items(destinationConfig).min(1), destinationConfig]).required()
});

function validateTrafficSplitConfig(config: TrafficSplitConfig) {
    const result = Joi.validate(config, trafficSplitConfigSchema);
    if (result.error) {
        throw new ValidationError(result.error);
    } else {
        return result.value;
    }
}

module.exports = function (config: TrafficSplitConfig) {
    validateTrafficSplitConfig(config);
    config.destinations = _.castArray(config.destinations || []);
    const values = config.destinations.map(destination => destination.target);
    const weights = config.destinations.map(destination => destination.weight);
    return (req: any) => {
        return chooser.select(values, weights);
    };
};
module.exports.factory = true;
