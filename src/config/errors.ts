'use strict';

import { Errors } from 'typescript-rest';
import * as Joi from 'joi';
import * as _ from 'lodash';

export class ValidationError extends Errors.ForbidenError {
    entity: any;

    constructor(entity?: string | Joi.ValidationError) {
        let message;
        if (entity instanceof String || typeof (entity) === 'string') {
            message = <string>entity;
        } else {
            message = ValidationError.buildValidationErrorString(entity);
        }
        super(message);
        this.entity = { error: message };
        Object.setPrototypeOf(this, ValidationError.prototype);
    }

    private static buildValidationErrorString(err: Joi.ValidationError) {
        const requiredFields: Array<string> = [];
        const unexpectedFields: Array<string> = [];
        const invalidFields: Array<string> = [];
        err.details.forEach(e => {
            if (_.endsWith(e.type, 'required')) {
                requiredFields.push(e.path);
            } else if (_.endsWith(e.type, 'Unknown')) {
                unexpectedFields.push(e.path);
            } else {
                invalidFields.push(e.path);
            }
        });

        const result = [];
        if (requiredFields.length > 0) {
            result.push(`Missing Required Fields: ${requiredFields.join(', ')}`);
        }
        if (unexpectedFields.length > 0) {
            result.push(`Unexpected Fields: ${unexpectedFields.join(', ')}`);
        }
        if (invalidFields.length > 0) {
            result.push(`Invalid value for Fields: ${invalidFields.join(', ')}`);
        }
        return result.join('\n');
    }
}
