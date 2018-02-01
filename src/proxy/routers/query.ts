'use strict';

import * as Joi from 'joi';
import * as _ from 'lodash';
import { ValidationError } from '../../error/errors';

interface QuerySplitConfig {
    destinations: Array<RouterDestination>;
    param: string;
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
const querySplitConfigSchema = Joi.object().keys({
    defaultTarget: Joi.string().required(),
    destinations: Joi.alternatives([Joi.array().items(destinationConfig).min(1), destinationConfig]).required(),
    param: Joi.string().required()
});

function validateQuerySplitConfig(config: QuerySplitConfig) {
    const result = Joi.validate(config, querySplitConfigSchema);
    if (result.error) {
        throw new ValidationError(result.error);
    } else {
        return result.value;
    }
}

module.exports = function(config: QuerySplitConfig) {
    validateQuerySplitConfig(config);
    const targets = new Map<string, string>();
    config.destinations = _.castArray(config.destinations || []);
    config.destinations.forEach(destination => {
        targets.set(destination.value, destination.target);
    });
    return (req: any) => {
        const param = req.query[config.param];
        let target = targets.get(param);
        if (!target) {
            target = config.defaultTarget;
        }
        return target;
    };
};
