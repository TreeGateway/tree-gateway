'use strict';

import * as Joi from 'joi';
import { ValidationError } from '../../error/errors';

interface HeaderSplitConfig {
    destinations: Array<RouterDestination>;
    name: string;
    defaultTarget: string;
}

interface RouterDestination {
    target: string;
    value: string;
}

const headerSplitConfigSchema = Joi.object().keys({
    defaultTarget: Joi.string().required(),
    destinations: Joi.array().items(Joi.object().keys({
        target: Joi.string().required(),
        value: Joi.string().required()
    })).min(1).required(),
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
