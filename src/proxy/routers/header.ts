'use strict';

import * as Joi from 'joi';
import { ValidationError } from '../../error/errors';
import * as _ from 'lodash';

interface HeaderSplitConfig {
    destinations: Array<RouterDestination>;
    name: string;
    defaultTarget: string;
}

interface RouterDestination {
    target: string;
    value: string;
}

const destinationConfig = Joi.object().keys({
    target: Joi.string().required(),
    value: Joi.string().required()
});

const headerSplitConfigSchema = Joi.object().keys({
    defaultTarget: Joi.string().required(),
    destinations: Joi.alternatives([Joi.array().items(destinationConfig).min(1), destinationConfig]).required(),
    name: Joi.string().required()
});

function validateHeaderSplitConfig(config: HeaderSplitConfig) {
    const result = Joi.validate(config, headerSplitConfigSchema);
    if (result.error) {
        throw new ValidationError(result.error);
    } else {
        return result.value;
    }
}

module.exports = function(config: HeaderSplitConfig) {
    validateHeaderSplitConfig(config);
    const targets = new Map<string, string>();
    config.destinations = _.castArray(config.destinations || []);
    config.destinations.forEach(destination => {
        targets.set(destination.value, destination.target);
    });
    return (req: any) => {
        const param = req.headers[config.name];
        let target = targets.get(param);
        if (!target) {
            target = config.defaultTarget;
        }
        return target;
    };
};
